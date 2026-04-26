# whisperx-cz

Lokální česká transkripce videa → SRT s word-level timingem pro **DaVinci Resolve Studio 20+** efekt **Word Highlight** (Effects → Titles → Subtitles → Animated).

## Co to dělá

```
$ ./transcribe.sh ~/videos/rozhovor.mp4
→ ~/videos/rozhovor.srt
```

- Transkribuje [WhisperX](https://github.com/m-bain/whisperX), model `large-v2` (pro češtinu lepší než `large-v3`).
- Word-level timestampy přes alignment model `comodoro/wav2vec2-xls-r-300m-cs-250`.
- SRT segmenty cca po větách, max ~5 s na cue (kratší cue lépe fungují s Word Highlight).
- Čísla v textu (`2026`, `13:30`) převede do slovní formy *před* alignmentem — wav2vec2 jinak digity neumí přiřadit timestamp.

## Požadavky

- **Python 3.11** — uv si ho stáhne sám, neřeš.
- [`uv`](https://github.com/astral-sh/uv)
- `ffmpeg` v `PATH`

### Instalace

**macOS:**
```
brew install uv ffmpeg
```

**Windows:**
```
winget install astral-sh.uv
winget install Gyan.FFmpeg
```

**Linux (Debian/Ubuntu):**
```
curl -LsSf https://astral.sh/uv/install.sh | sh
sudo apt install ffmpeg
```

## Setup projektu

```
cd whisperx-cz
uv sync
```

První `uv sync` stáhne PyTorch (~500 MB na macOS, ~2,5 GB na Linux/Windows s CUDA buildem) a WhisperX. Trvá pár minut.

## Použití

```
./transcribe.sh /cesta/k/videu.mp4
```

Volitelné argumenty:
- `--model large-v3` — pokud chceš zkusit novější (default `large-v2`)
- `--language en` — jiný jazyk (default `cs`)
- `--max-segment-seconds 4` — kratší cue, agresivnější dělení
- `--max-line-chars 42` — znaků na řádek (wrap na max 2 řádky)
- `--max-words-per-cue 4` — cue po N slovech (TikTok/Reels styl, 0 = bez limitu)
- `--gap-fill 2.0` — prodluž cue.end k dalšímu cue.start, je-li mezera kratší (zabrání blikání)

Windows:
```
transcribe.bat C:\videa\rozhovor.mp4
```

První spuštění stáhne Whisper model (`large-v2`, ~3 GB) a alignment model (~1 GB) do `~/.cache/`. Další běhy jdou rychle z cache.

## Detekce platformy (autodetekt, neřeš)

| Platforma | Backend | `compute_type` |
|---|---|---|
| macOS Apple Silicon | CPU | `int8` |
| Linux/Windows + NVIDIA GPU | CUDA | `float16` |
| Linux/Windows bez GPU | CPU | `int8` |

Na M1/M2/M3 očekávej cca **realtime ratio 2–4×** (10 min audia = 2–5 min zpracování). Na NVIDIA GPU 20–50×.

## Workflow v DaVinci Resolve

1. **File → Import → Subtitle** → vyber `*.srt`.
2. SRT se objeví na subtitle tracku.
3. V panelu **Effects → Titles → Subtitles → Animated** najdi **Word Highlight**.
4. Přetáhni na *header* subtitle tracku (ne na jednotlivý cue).
5. Word-level zvýraznění by mělo sednout na mluvený zvuk s odchylkou ±100 ms.

Pokud zvýraznění "prokluzuje" o slovo: zkontroluj log z `transcribe.sh`, jestli neoznámil **„Numbers that may not align cleanly"** — wav2vec2 nedokáže alignovat zbytkové digity. Buď přepiš ručně v SRT, nebo nahraď v transkripci slovní formou a re-align.

## Reset cache

Stažené modely:
- WhisperX (faster-whisper): `~/.cache/huggingface/hub/`
- Alignment models: `~/.cache/huggingface/hub/`
- VAD model: `~/.cache/torch/`

Smazat všechno:
```
rm -rf ~/.cache/huggingface ~/.cache/torch
```

## Troubleshooting

**`ffmpeg: command not found`** → instaluj přes brew/winget/apt (viz Instalace).

**`CUDA out of memory`** (Linux/Windows) → přidej `--model medium` nebo sniž `batch_size` v `transcribe.py` (řádek `batch_size = 16`).

**`OSError: [E050] Can't find model` při alignmentu** → zkontroluj síť, HuggingFace občas timeoutuje. Spusť znovu, model se dostáhne.

**Halucinace v SRT** (text který v audiu není) → typický pro `large-v3`. Zkus default `large-v2`. U dlouhých ticha pomáhá VAD (WhisperX má aktivní by default).

**Zpomalení na M1 8GB** → `large-v2` se sotva vejde. Použij `--model medium`.

**Karaoke prokluzuje** → buď je v SRT zbytkové číslo (viz log), nebo segment je delší než 5 s. Zkus `--max-segment-seconds 3`.

## Mimo scope

- Diarizace (kdo mluví) — pro monolog netřeba.
- Burn-in titulků — to udělá Resolve při exportu.
- Překlad — pouze CZ → CZ.
- GUI.
