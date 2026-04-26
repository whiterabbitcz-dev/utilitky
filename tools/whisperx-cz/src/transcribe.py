#!/usr/bin/env python3
"""Local Czech transcription via WhisperX → SRT for DaVinci Resolve Word Highlight."""

from __future__ import annotations

import argparse
import gc
import logging
import os
import platform
import re
import sys
import time
from pathlib import Path

# uv-managed Python (python-build-standalone) doesn't ship system CA certs, so
# torch.hub.load() and other urllib-based downloads (silero VAD from github.com,
# any non-HF endpoint) hit SSL: CERTIFICATE_VERIFY_FAILED on macOS. Point urllib
# at certifi's bundle, which is already a transitive dep via huggingface-hub.
try:
    import certifi
    os.environ.setdefault("SSL_CERT_FILE", certifi.where())
    os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
except Exception:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("transcribe")

VALID_EXTS = {".mp4", ".mov", ".mkv", ".wav", ".m4a", ".mp3", ".aac", ".flac", ".webm", ".avi"}
MAX_SEGMENT_SECONDS = 5.0
MAX_LINE_CHARS = 42       # per-line cap, ~Netflix/BBC norm
MAX_WORDS_PER_CUE = 0     # 0 = no cap (full sentences). Set 3-4 for TikTok/Reels style.
GAP_FILL_SECONDS = 2.0    # extend cue.end to next cue.start if gap is shorter
SAMPLE_RATE = 16000


def detect_platform() -> tuple[str, str, int]:
    """Returns (device, compute_type, batch_size)."""
    system = platform.system()

    if system == "Darwin":
        log.info("macOS detected → CPU + int8 (MPS not reliable in WhisperX)")
        return "cpu", "int8", 4

    try:
        import torch
        if torch.cuda.is_available():
            name = torch.cuda.get_device_name(0)
            log.info(f"CUDA detected → GPU + float16 ({name})")
            return "cuda", "float16", 16
    except Exception as e:
        log.warning(f"CUDA detection failed: {e}")

    log.info(f"{system} without GPU → CPU + int8")
    return "cpu", "int8", 4


# --- Czech number → words ---

def _num2words_cs(n: int) -> str:
    from num2words import num2words
    try:
        return num2words(n, lang="cs")
    except Exception as e:
        log.warning(f"num2words failed for {n}: {e}")
        return str(n)


def _convert_time(match: re.Match) -> str:
    parts = [int(p) for p in match.group(0).split(":")]
    if len(parts) == 2:
        h, m = parts
        if m == 0:
            return f"{_num2words_cs(h)} hodin"
        return f"{_num2words_cs(h)} hodin {_num2words_cs(m)}"
    h, m, s = parts
    return f"{_num2words_cs(h)} hodin {_num2words_cs(m)} minut {_num2words_cs(s)}"


def _convert_decimal(m: re.Match) -> str:
    whole, frac = m.group(0).replace(".", ",").split(",")
    return f"{_num2words_cs(int(whole))} celá {_num2words_cs(int(frac))}"


def normalize_numbers(text: str) -> tuple[str, list[str]]:
    """Replace digits with Czech word form. Returns (new_text, warnings)."""
    warnings: list[str] = []

    text = re.sub(r"\b\d{1,2}:\d{2}(?::\d{2})?\b", _convert_time, text)
    text = re.sub(r"\b\d+[.,]\d+\b", _convert_decimal, text)

    def _int(m: re.Match) -> str:
        try:
            return _num2words_cs(int(m.group(0)))
        except Exception:
            warnings.append(m.group(0))
            return m.group(0)

    text = re.sub(r"\b\d+\b", _int, text)

    leftover = re.findall(r"\d+", text)
    warnings.extend(leftover)
    return text, warnings


# --- SRT writing ---

def _format_srt_time(seconds: float) -> str:
    if seconds < 0 or seconds is None:
        seconds = 0.0
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int(round((seconds - int(seconds)) * 1000))
    if ms == 1000:
        s += 1
        ms = 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def _word_time(w: dict, key: str, fallback: float) -> float:
    v = w.get(key)
    if v is None:
        return fallback
    return float(v)


def _join_words(words: list[dict]) -> str:
    text = " ".join((ww.get("word") or "").strip() for ww in words).strip()
    return re.sub(r"\s+([,.!?…;:])", r"\1", text)


def _fits_in_two_lines(text: str, max_chars: int) -> bool:
    """True iff text can be wrapped to 1 or 2 lines, each ≤ max_chars, on word boundaries."""
    if len(text) <= max_chars:
        return True
    words = text.split()
    for i in range(1, len(words)):
        line1_len = len(" ".join(words[:i]))
        line2_len = len(" ".join(words[i:]))
        if line1_len <= max_chars and line2_len <= max_chars:
            return True
    return False


def _split_long_segment(
    segment: dict,
    max_seconds: float,
    max_line_chars: int,
    max_words: int = 0,
) -> list[dict]:
    """Split a segment at sentence ends, word boundaries, or time/wrap/word caps."""
    words = segment.get("words") or []
    seg_start = float(segment.get("start", 0.0))
    seg_end = float(segment.get("end", seg_start))
    seg_text = (segment.get("text") or "").strip()

    if not words or (
        (seg_end - seg_start) <= max_seconds
        and _fits_in_two_lines(seg_text, max_line_chars)
        and (max_words <= 0 or len(seg_text.split()) <= max_words)
    ):
        return [{"start": seg_start, "end": seg_end, "text": seg_text}]

    chunks: list[dict] = []
    current: list[dict] = []
    chunk_start = _word_time(words[0], "start", seg_start)
    last_end = chunk_start

    for w in words:
        w_start = _word_time(w, "start", last_end)
        w_end = _word_time(w, "end", w_start)

        # Pre-check: would adding this word break the time cap, the wrap guarantee,
        # or the per-cue word cap? If so, flush `current` first so the new word
        # starts a fresh chunk.
        if current:
            would_overflow_time = (w_end - chunk_start) > max_seconds
            would_break_wrap = not _fits_in_two_lines(_join_words(current + [w]), max_line_chars)
            would_overflow_words = max_words > 0 and len(current) >= max_words
            if would_overflow_time or would_break_wrap or would_overflow_words:
                chunks.append({"start": chunk_start, "end": last_end, "text": _join_words(current)})
                current = []
                chunk_start = w_start

        if not current:
            chunk_start = w_start
        current.append(w)
        last_end = w_end

        # Sentence-final punctuation is a natural break; flush AFTER so the punct stays.
        word_text = (w.get("word") or "").strip()
        if word_text.endswith((".", "!", "?", "…")):
            chunks.append({"start": chunk_start, "end": w_end, "text": _join_words(current)})
            current = []

    if current:
        chunks.append({"start": chunk_start, "end": last_end, "text": _join_words(current)})

    return chunks


def _wrap_two_lines(text: str, max_chars: int) -> str:
    """Balanced two-line wrap on word boundaries. Returns text with optional '\\n'."""
    if len(text) <= max_chars:
        return text

    words = text.split()
    if len(words) < 2:
        return text  # one giant word, nothing to do

    # Find the split point that minimizes |line1 - line2| while keeping both ≤ max_chars.
    best_idx = -1
    best_diff = float("inf")
    for i in range(1, len(words)):
        line1 = " ".join(words[:i])
        line2 = " ".join(words[i:])
        if len(line1) > max_chars or len(line2) > max_chars:
            continue
        diff = abs(len(line1) - len(line2))
        if diff < best_diff:
            best_diff = diff
            best_idx = i

    if best_idx == -1:
        # No split keeps both lines within limit. Best-effort: split at word closest to midpoint.
        mid = len(text) // 2
        running = 0
        for i, w in enumerate(words[:-1]):
            running += len(w) + (1 if i > 0 else 0)
            if running >= mid:
                best_idx = i + 1
                break
        if best_idx == -1:
            best_idx = len(words) // 2

    return f"{' '.join(words[:best_idx])}\n{' '.join(words[best_idx:])}"


def _fill_gaps(cues: list[dict], max_gap: float) -> list[dict]:
    """Extend cue.end to next cue.start if the gap is short enough (no on-screen flicker)."""
    if max_gap <= 0:
        return cues
    for i in range(len(cues) - 1):
        gap = cues[i + 1]["start"] - cues[i]["end"]
        if 0 < gap <= max_gap:
            cues[i]["end"] = cues[i + 1]["start"]
    return cues


def write_srt(
    segments: list[dict],
    output_path: Path,
    max_seconds: float = MAX_SEGMENT_SECONDS,
    max_line_chars: int = MAX_LINE_CHARS,
    gap_fill: float = GAP_FILL_SECONDS,
    max_words: int = MAX_WORDS_PER_CUE,
) -> int:
    cues: list[dict] = []
    for seg in segments:
        cues.extend(_split_long_segment(seg, max_seconds, max_line_chars, max_words))

    cues = [c for c in cues if (c.get("text") or "").strip()]
    cues = _fill_gaps(cues, gap_fill)

    with output_path.open("w", encoding="utf-8") as f:
        for i, c in enumerate(cues, 1):
            text = _wrap_two_lines((c.get("text") or "").strip(), max_line_chars)
            f.write(f"{i}\n")
            f.write(f"{_format_srt_time(c['start'])} --> {_format_srt_time(c['end'])}\n")
            f.write(f"{text}\n\n")
    return len(cues)


# --- Main ---

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Local Czech transcription → SRT for DaVinci Resolve Word Highlight",
    )
    parser.add_argument("input", type=Path, help="Path to video/audio file")
    parser.add_argument("--model", default="large-v2", help="Whisper model (default: large-v2)")
    parser.add_argument("--language", default="cs", help="Language code (default: cs)")
    parser.add_argument("--max-segment-seconds", type=float, default=MAX_SEGMENT_SECONDS,
                        help=f"Max SRT cue length in seconds (default: {MAX_SEGMENT_SECONDS})")
    parser.add_argument("--max-line-chars", type=int, default=MAX_LINE_CHARS,
                        help=f"Max characters per subtitle line, wrapped to 2 lines (default: {MAX_LINE_CHARS})")
    parser.add_argument("--gap-fill", type=float, default=GAP_FILL_SECONDS,
                        help=f"Extend cue.end to next cue.start when gap ≤ N seconds (default: {GAP_FILL_SECONDS}, 0 disables)")
    parser.add_argument("--max-words-per-cue", type=int, default=MAX_WORDS_PER_CUE,
                        help=f"Cap each cue at N words (TikTok/Reels style: try 3-4). Default {MAX_WORDS_PER_CUE} = no cap.")
    args = parser.parse_args()

    if not args.input.exists():
        log.error(f"Input file not found: {args.input}")
        return 2
    if not args.input.is_file():
        log.error(f"Not a file: {args.input}")
        return 2
    if args.input.suffix.lower() not in VALID_EXTS:
        log.warning(f"Unusual file extension {args.input.suffix} — trying anyway")

    output_path = args.input.with_suffix(".srt")

    device, compute_type, batch_size = detect_platform()

    log.info("Loading WhisperX (heavy import, ~5-10s)...")
    import whisperx

    # PyTorch 2.6 flipped torch.load weights_only default to True; pyannote/lightning
    # checkpoints contain omegaconf.ListConfig which isn't in the default allowlist.
    # Allowlist the few classes those checkpoints actually use, so even fallback paths
    # that touch pyannote VAD (or any pyannote checkpoint) still load.
    try:
        import torch
        from omegaconf.listconfig import ListConfig
        from omegaconf.dictconfig import DictConfig
        from omegaconf.base import ContainerMetadata, Metadata
        torch.serialization.add_safe_globals([ListConfig, DictConfig, ContainerMetadata, Metadata])
    except Exception as e:
        log.debug(f"safe_globals registration skipped: {e}")

    t0 = time.time()

    log.info(f"Loading Whisper model '{args.model}' on {device}/{compute_type} (VAD: silero)")
    log.info("First run downloads ~3 GB to ~/.cache — please wait")
    model = whisperx.load_model(
        args.model,
        device,
        compute_type=compute_type,
        language=args.language,
        vad_method="silero",
    )

    log.info(f"Loading audio: {args.input.name}")
    audio = whisperx.load_audio(str(args.input))
    audio_seconds = len(audio) / SAMPLE_RATE
    log.info(f"Audio duration: {audio_seconds:.1f}s ({audio_seconds/60:.1f} min)")

    log.info(f"Transcribing (batch_size={batch_size})...")
    result = model.transcribe(audio, batch_size=batch_size, language=args.language)

    del model
    gc.collect()
    if device == "cuda":
        try:
            import torch
            torch.cuda.empty_cache()
        except Exception:
            pass

    log.info("Normalizing numbers (digits → Czech words, before alignment)")
    all_warnings: list[str] = []
    for seg in result["segments"]:
        original = seg.get("text", "")
        new_text, warnings = normalize_numbers(original)
        if new_text != original:
            log.debug(f"  «{original.strip()}» → «{new_text.strip()}»")
        seg["text"] = new_text
        all_warnings.extend(warnings)
    if all_warnings:
        unique = sorted(set(all_warnings))
        log.warning(f"Numbers that may not align cleanly: {unique}")

    log.info(f"Loading alignment model for '{args.language}' (auto-pick: comodoro/wav2vec2-xls-r-300m-cs-250 for cs)")
    align_model, metadata = whisperx.load_align_model(
        language_code=args.language,
        device=device,
    )

    log.info("Aligning word-level timestamps...")
    aligned = whisperx.align(
        result["segments"],
        align_model,
        metadata,
        audio,
        device,
        return_char_alignments=False,
    )

    del align_model
    gc.collect()
    if device == "cuda":
        try:
            import torch
            torch.cuda.empty_cache()
        except Exception:
            pass

    log.info(f"Writing SRT → {output_path}")
    word_cap = f", max {args.max_words_per_cue} words/cue" if args.max_words_per_cue > 0 else ""
    log.info(f"  cue: max {args.max_segment_seconds}s, wrap at {args.max_line_chars} chars × 2 lines, gap-fill ≤ {args.gap_fill}s{word_cap}")
    n_cues = write_srt(
        aligned["segments"],
        output_path,
        max_seconds=args.max_segment_seconds,
        max_line_chars=args.max_line_chars,
        gap_fill=args.gap_fill,
        max_words=args.max_words_per_cue,
    )

    elapsed = time.time() - t0
    rt_ratio = audio_seconds / elapsed if elapsed > 0 else 0
    log.info(
        f"Done. {n_cues} cues, {audio_seconds:.1f}s audio, processed in {elapsed:.1f}s "
        f"(realtime: {rt_ratio:.2f}x)"
    )

    return 0


if __name__ == "__main__":
    sys.exit(main())
