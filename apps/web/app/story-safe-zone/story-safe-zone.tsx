"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Surface = "story" | "storyWithReply" | "reels"

type SafeZone = {
  topPct: number
  bottomPct: number
  rightPct: number
  topLabel: string
  bottomLabel: string
  rightLabel?: string
}

const SURFACES: Record<Surface, SafeZone> = {
  story: {
    topPct: 0.13,
    bottomPct: 0.13,
    rightPct: 0,
    topLabel: "Hlavička (jméno, čas)",
    bottomLabel: "Reakce a sticker tray",
  },
  storyWithReply: {
    topPct: 0.13,
    bottomPct: 0.18,
    rightPct: 0,
    topLabel: "Hlavička (jméno, čas)",
    bottomLabel: "Pole pro odpověď",
  },
  reels: {
    topPct: 0.115,
    bottomPct: 0.245,
    rightPct: 0.1,
    topLabel: "Hlavička",
    bottomLabel: "Popisek, zvuk, profil",
    rightLabel: "Akční sloupec",
  },
}

const SURFACE_LABELS: Record<Surface, string> = {
  story: "Story",
  storyWithReply: "Story s odpovědí",
  reels: "Reels",
}

const ACCEPT = "image/png,image/jpeg,image/webp"

type LoadedImage = {
  src: string
  width: number
  height: number
  name: string
}

export function StorySafeZone() {
  const [image, setImage] = React.useState<LoadedImage | null>(null)
  const [surface, setSurface] = React.useState<Surface>("story")
  const [dragActive, setDragActive] = React.useState(false)
  const [downloading, setDownloading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const safeZone = SURFACES[surface]

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Nahraj prosím obrázek (PNG, JPG, WebP).")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const probe = new Image()
      probe.onload = () => {
        setImage({
          src,
          width: probe.naturalWidth,
          height: probe.naturalHeight,
          name: file.name,
        })
      }
      probe.onerror = () => toast.error("Obrázek se nepodařilo načíst.")
      probe.src = src
    }
    reader.onerror = () => toast.error("Soubor se nepodařilo přečíst.")
    reader.readAsDataURL(file)
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) loadFile(file)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  function reset() {
    setImage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function downloadAnnotated() {
    if (!image) return
    setDownloading(true)
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not available")

      canvas.width = image.width
      canvas.height = image.height

      const probe = new Image()
      await new Promise<void>((resolve, reject) => {
        probe.onload = () => resolve()
        probe.onerror = () => reject(new Error("image load"))
        probe.src = image.src
      })
      ctx.drawImage(probe, 0, 0, image.width, image.height)

      ctx.fillStyle = "rgba(239, 68, 68, 0.45)"
      const topH = image.height * safeZone.topPct
      const bottomH = image.height * safeZone.bottomPct
      const rightW = image.width * safeZone.rightPct
      ctx.fillRect(0, 0, image.width, topH)
      ctx.fillRect(0, image.height - bottomH, image.width, bottomH)
      if (rightW > 0) {
        ctx.fillRect(
          image.width - rightW,
          topH,
          rightW,
          image.height - topH - bottomH,
        )
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      )
      if (!blob) throw new Error("Could not encode PNG")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = image.name.replace(/\.[^.]+$/, "")
      link.href = url
      link.download = `${baseName}-safe-zone-${surface}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Náhled stažen.")
    } catch (error) {
      console.error(error)
      toast.error("Stažení se nepodařilo.")
    } finally {
      setDownloading(false)
    }
  }

  const aspect = image ? image.width / image.height : 9 / 16
  const isPortrait = aspect <= 9 / 16 + 0.01

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),320px]">
      <section>
        {!image ? (
          <div
            onDragOver={(event) => {
              event.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                inputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Nahrát obrázek"
            className={cn(
              "flex aspect-[9/16] max-h-[640px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-darker px-6 text-center transition-colors",
              dragActive
                ? "border-accent bg-card"
                : "border-card hover:border-accent/60",
            )}
          >
            <p className="text-[1.125rem] font-bold text-white">
              Přetáhni sem obrázek
            </p>
            <p className="mt-2 text-[0.875rem] text-gray-400">
              nebo klikni a vyber. PNG, JPG, WebP. Ideálně 1080 × 1920.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(event) => handleFiles(event.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="relative mx-auto overflow-hidden rounded-xl bg-darker"
              style={{
                aspectRatio: `${image.width} / ${image.height}`,
                maxHeight: "min(80vh, 720px)",
                maxWidth: isPortrait ? "min(100%, 405px)" : "100%",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.name}
                className="absolute inset-0 h-full w-full object-contain"
              />
              <div
                className="absolute inset-x-0 top-0 flex items-center justify-center bg-red-500/45 text-[0.75rem] font-bold tracking-caps text-white"
                style={{ height: `${safeZone.topPct * 100}%` }}
              >
                {safeZone.topLabel.toUpperCase()}
              </div>
              <div
                className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-red-500/45 text-[0.75rem] font-bold tracking-caps text-white"
                style={{ height: `${safeZone.bottomPct * 100}%` }}
              >
                {safeZone.bottomLabel.toUpperCase()}
              </div>
              {safeZone.rightPct > 0 && safeZone.rightLabel ? (
                <div
                  className="absolute right-0 flex items-center justify-center bg-red-500/45 text-center text-[0.625rem] font-bold tracking-caps text-white"
                  style={{
                    width: `${safeZone.rightPct * 100}%`,
                    top: `${safeZone.topPct * 100}%`,
                    bottom: `${safeZone.bottomPct * 100}%`,
                  }}
                >
                  {safeZone.rightLabel.toUpperCase()}
                </div>
              ) : null}
            </div>

            <p className="text-center text-[0.8125rem] text-gray-400">
              {image.width} × {image.height} px
              {Math.abs(image.width / image.height - 9 / 16) > 0.01
                ? ". Doporučený poměr 9:16."
                : "."}
            </p>
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <div>
          <p className="mb-3 text-[0.75rem] font-bold tracking-caps text-gray-400">
            POVRCH
          </p>
          <div className="grid grid-cols-1 gap-2">
            {(Object.keys(SURFACES) as Surface[]).map((key) => {
              const active = surface === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSurface(key)}
                  className={cn(
                    "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    active
                      ? "border-accent bg-card text-white"
                      : "border-card bg-darker text-gray-400 hover:text-white",
                  )}
                  aria-pressed={active}
                >
                  <span className="font-bold">{SURFACE_LABELS[key]}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[0.75rem] font-bold tracking-caps text-gray-400">
            ZAKRYTÉ ZÓNY
          </p>
          <ul className="space-y-2 text-[0.875rem] text-gray-400">
            <li>
              Nahoře:{" "}
              <span className="text-white">
                {Math.round(safeZone.topPct * 100)} %
              </span>{" "}
              ({safeZone.topLabel.toLowerCase()})
            </li>
            <li>
              Dole:{" "}
              <span className="text-white">
                {Math.round(safeZone.bottomPct * 100)} %
              </span>{" "}
              ({safeZone.bottomLabel.toLowerCase()})
            </li>
            {safeZone.rightPct > 0 ? (
              <li>
                Vpravo:{" "}
                <span className="text-white">
                  {Math.round(safeZone.rightPct * 100)} %
                </span>{" "}
                ({safeZone.rightLabel?.toLowerCase()})
              </li>
            ) : null}
          </ul>
        </div>

        <div className="space-y-2">
          <Button
            variant="primary"
            size="md"
            onClick={downloadAnnotated}
            disabled={!image || downloading}
            className="w-full"
          >
            {downloading ? "Stahuji..." : "Stáhnout náhled"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={reset}
            disabled={!image}
            className="w-full"
          >
            Začít znovu
          </Button>
        </div>

        <p className="text-[0.75rem] leading-[1.5] text-gray-500">
          Hodnoty jsou orientační. Apple a Android UI se mírně liší. Vždy nech
          rezervu.
        </p>
      </aside>
    </div>
  )
}
