import { ToolShell } from "@/components/tool-shell"
import { StorySafeZone } from "./story-safe-zone"

export const metadata = {
  title: "Story safe zone | WR tools",
  description:
    "Vidíš, co ti zakryje IG UI v Stories a Reels. Nahraj obrázek a hned uvidíš bezpečnou zónu.",
}

export default function StorySafeZonePage() {
  return (
    <ToolShell
      title="Story safe zone"
      subtitle="Vidíš, co ti zakryje IG UI v Stories a Reels."
    >
      <StorySafeZone />
    </ToolShell>
  )
}
