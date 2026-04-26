import { ToolShell } from "@/components/tool-shell"

type ChangelogEntry = {
  date: string
  version: string
  title: string
  bullets: string[]
}

const entries: ChangelogEntry[] = [
  {
    date: "27. dubna 2026",
    version: "0.4.0",
    title: "IG crop preview",
    bullets: [
      "Druhý živý nástroj. Nahraj fotku a hned vidíš všech 5 IG formátů: feed portrét, čtverec, na šířku, profil v gridu a story.",
      "Každý náhled má vlastní ořez. Posouvej myší nebo prstem, zoomuj kolečkem nebo posuvníkem.",
      "Profil v gridu se ukazuje jako 3×3 mřížka s ghost dlaždicemi (poměr 3:4 podle IG 2025).",
      "Stažení po kartě ve cílovém rozlišení (long side 1350 px, JPG kvalita 95).",
    ],
  },
  {
    date: "27. dubna 2026",
    version: "0.3.0",
    title: "Titulkovač videa",
    bullets: [
      "Lokální Python CLI v `tools/whisperx-cz`. Video do SRT s word-level timingem.",
      "WhisperX large-v2 plus česká alignment přes comodoro/wav2vec2-xls-r-300m-cs-250.",
      "Připraveno pro DaVinci Resolve Word highlight, TikTok/Reels styl 2 až 4 slova na cue.",
    ],
  },
  {
    date: "26. dubna 2026",
    version: "0.2.0",
    title: "Story safe zone",
    bullets: [
      "První živý nástroj. Nahraj 9:16 obrázek a vidíš, kam ti IG sáhne.",
      "Tři pohledy: Story, Story s odpovědí, Reels.",
      "Stažení anotovaného PNG s vyznačenými zónami.",
    ],
  },
  {
    date: "26. dubna 2026",
    version: "0.1.0",
    title: "Začínáme",
    bullets: [
      "Založen monorepo a design system.",
      "Hotový tool shell. Připraveno pro první nástroj.",
      "Katalog ukazuje plánované utility.",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <ToolShell
      title="Changelog"
      subtitle="Co se kdy přidalo nebo opravilo."
    >
      <ol className="space-y-10 pb-12">
        {entries.map((entry) => (
          <li
            key={entry.version}
            className="border-l-4 border-accent rounded-r-[12px] bg-card p-6"
          >
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-[0.875rem] text-gray-400">
                {entry.date}
              </span>
              <span className="text-[0.875rem] font-bold text-accent">
                v{entry.version}
              </span>
            </div>
            <h2 className="mt-2 text-[1.5rem] font-bold text-white">
              {entry.title}
            </h2>
            <ul className="mt-4 space-y-2">
              {entry.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="text-[0.875rem] leading-[1.6] text-gray-400"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </ToolShell>
  )
}
