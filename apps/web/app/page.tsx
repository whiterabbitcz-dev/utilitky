import Link from "next/link"
import { ToolCard } from "@/components/tool-card"
import { FeedbackWidget } from "@/components/feedback-widget"
import { Footer } from "@/components/footer"

const tools: Array<{
  href: string
  title: string
  description: string
  status: "live" | "soon" | "beta" | "cli"
}> = [
  {
    href: "/story-safe-zone",
    title: "Story safe zone",
    description: "Vidíš co ti zakryje IG UI.",
    status: "live",
  },
  {
    href: "/ig-crop-preview",
    title: "IG crop preview",
    description:
      "Nahraj fotku a uvidíš ji ve všech IG formátech najednou. Posouvej, zoomuj, stahuj.",
    status: "live",
  },
  {
    href: "https://github.com/whiterabbitcz-dev/utilitky/tree/main/tools/whisperx-cz",
    title: "Titulkovač videa",
    description: "Video do SRT s word-level timingem pro DaVinci Resolve.",
    status: "cli",
  },
  {
    href: "/multi-format-exporter",
    title: "Multi formát exporter",
    description: "Jeden obrázek, všechny sociální poměry.",
    status: "soon",
  },
  {
    href: "/carousel-splitter",
    title: "Carousel splitter",
    description: "Dlouhý obrázek na 10 IG slidů.",
    status: "soon",
  },
  {
    href: "/mockup-generator",
    title: "Mockup generátor",
    description: "Screenshot do device framu.",
    status: "soon",
  },
  {
    href: "/voice-over-kalkulacka",
    title: "Voice over kalkulačka",
    description: "Odhad délky čtení v CZ, EN, SK.",
    status: "soon",
  },
  {
    href: "/office-slimmer",
    title: "Office slimmer",
    description: "Zmenši pptx, docx, pdf.",
    status: "soon",
  },
]

const liveTools = tools.filter((tool) => tool.status === "live")
const cliTools = tools.filter((tool) => tool.status === "cli")
const soonTools = tools.filter(
  (tool) => tool.status !== "live" && tool.status !== "cli",
)

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-card bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6">
          <Link
            href="/"
            className="text-[1.25rem] font-bold text-accent"
            aria-label="WR tools"
          >
            WR
          </Link>
          <nav className="text-[0.875rem]">
            <Link
              href="/changelog"
              className="text-gray-400 transition-colors hover:text-white"
            >
              changelog
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 pb-20 pt-24 sm:pt-32">
          <div className="mx-auto max-w-[800px] text-center">
            <h1
              className="font-extrabold text-white"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                lineHeight: 1.05,
              }}
            >
              Nástroje pro lidi co dělají obsah.
            </h1>
            <p className="mt-6 text-base text-gray-400 sm:text-lg">
              Zdarma. Bez registrace pro základní použití.
            </p>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-[1200px] space-y-12">
            {liveTools.length > 0 ? (
              <div>
                <p className="mb-6 text-[0.75rem] font-bold tracking-caps text-accent">
                  ŽIVĚ
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {liveTools.map((tool) => (
                    <ToolCard
                      key={tool.title}
                      href={tool.href}
                      title={tool.title}
                      description={tool.description}
                      status={tool.status}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {cliTools.length > 0 ? (
              <div>
                <p className="mb-6 text-[0.75rem] font-bold tracking-caps text-accent">
                  LOKÁLNĚ
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {cliTools.map((tool) => (
                    <ToolCard
                      key={tool.title}
                      href={tool.href}
                      title={tool.title}
                      description={tool.description}
                      status={tool.status}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {soonTools.length > 0 ? (
              <div>
                <p className="mb-6 text-[0.75rem] font-bold tracking-caps text-gray-400">
                  BRZY ZDE
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {soonTools.map((tool) => (
                    <ToolCard
                      key={tool.title}
                      href={tool.href}
                      title={tool.title}
                      description={tool.description}
                      status={tool.status}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <FeedbackWidget />
      </main>

      <Footer />
    </div>
  )
}
