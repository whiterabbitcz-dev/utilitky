import { ToolShell } from "@/components/tool-shell"
import { IgCropPreview } from "./ig-crop-preview"

export const metadata = {
  title: "IG crop preview | WR tools",
  description:
    "Nahraj fotku a uvidíš ji ve všech Instagram formátech najednou: feed, profil, story. Ořez si srovnáš ručně a stáhneš.",
}

export default function IgCropPreviewPage() {
  return (
    <ToolShell
      title="IG crop preview"
      subtitle="Nahraj fotku a uvidíš ji ve všech IG formátech najednou. Posouvej, zoomuj, stahuj."
    >
      <IgCropPreview />
    </ToolShell>
  )
}
