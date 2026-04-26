import Link from "next/link"
import { cn } from "@/lib/utils"

type ToolCardProps = {
  href: string
  title: string
  description: string
  status?: "live" | "soon" | "beta"
}

const statusLabels: Record<NonNullable<ToolCardProps["status"]>, string> = {
  live: "ŽIVĚ",
  soon: "BRZY",
  beta: "BETA",
}

export function ToolCard({ href, title, description, status }: ToolCardProps) {
  const isSoon = status === "soon"

  const content = (
    <>
      {status ? (
        <span className="absolute right-4 top-4 text-[0.75rem] font-bold tracking-caps text-accent">
          {statusLabels[status]}
        </span>
      ) : null}
      <h3 className="text-[1.125rem] font-bold text-white">{title}</h3>
      <p className="mt-2 text-[0.875rem] leading-[1.5] text-gray-400">
        {description}
      </p>
    </>
  )

  const baseClasses = cn(
    "relative block bg-card p-6",
    "border-l-4 border-accent",
    "rounded-l-none rounded-r-[12px]",
    isSoon
      ? "cursor-not-allowed opacity-60"
      : "transition-transform hover:-translate-y-0.5",
  )

  if (isSoon) {
    return (
      <div className={baseClasses} aria-disabled="true">
        {content}
      </div>
    )
  }

  return (
    <Link href={href} className={baseClasses}>
      {content}
    </Link>
  )
}
