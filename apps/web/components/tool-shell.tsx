import Link from "next/link"
import { FeedbackWidget } from "@/components/feedback-widget"
import { Footer } from "@/components/footer"

type ToolShellProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function ToolShell({ title, subtitle, children }: ToolShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-card bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center px-6">
          <Link
            href="/"
            className="text-[1.25rem] font-bold text-accent transition-opacity hover:opacity-80"
            aria-label="Zpět na úvod"
          >
            WR
          </Link>
          <nav className="ml-4 text-[0.875rem] text-gray-400">
            <Link href="/" className="hover:text-white">
              tools
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{title.toLowerCase()}</span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-[1200px] px-6 pb-12 pt-20">
          <h1
            className="font-bold text-white"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1 }}
          >
            {title}
          </h1>
          <p className="mt-3 text-base text-gray-400">{subtitle}</p>
        </section>

        <div className="mx-auto max-w-[1200px] px-6">{children}</div>

        <FeedbackWidget />
      </main>

      <Footer />
    </div>
  )
}
