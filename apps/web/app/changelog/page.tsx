import { ToolShell } from "@/components/tool-shell"

type ChangelogEntry = {
  date: string
  version: string
  title: string
  bullets: string[]
}

const entries: ChangelogEntry[] = [
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
