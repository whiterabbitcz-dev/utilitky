"use client"

import * as React from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FormatId = "portrait" | "square" | "landscape" | "profile" | "story"

type Format = {
  id: FormatId
  name: string
  ratio: number
  desc: string
  gridPreview?: boolean
}

const FORMATS: Format[] = [
  {
    id: "portrait",
    name: "Feed: portrét",
    ratio: 4 / 5,
    desc: "1080 × 1350 (4:5)",
  },
  {
    id: "square",
    name: "Feed: čtverec",
    ratio: 1,
    desc: "1080 × 1080 (1:1)",
  },
  {
    id: "landscape",
    name: "Feed: na šířku",
    ratio: 1.91,
    desc: "1080 × 566 (1.91:1)",
  },
  {
    id: "profile",
    name: "Profil v gridu",
    ratio: 3 / 4,
    desc: "1015 × 1350 (3:4)",
    gridPreview: true,
  },
  {
    id: "story",
    name: "Story a Reels",
    ratio: 9 / 16,
    desc: "1080 × 1920 (9:16)",
  },
]

const ACCEPT = "image/png,image/jpeg,image/webp"

type LoadedImage = {
  src: string
  width: number
  height: number
  name: string
}

export function IgCropPreview() {
  const [image, setImage] = React.useState<LoadedImage | null>(null)
  const [dragActive, setDragActive] = React.useState(false)
  const [resetKey, setResetKey] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const loadFile = React.useCallback((file: File) => {
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
  }, [])

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (file) loadFile(file)
  }

  function handleDropOnZone(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragActive(false)
    handleFiles(event.dataTransfer.files)
  }

  React.useEffect(() => {
    if (!image) return
    function onDragOver(event: DragEvent) {
      event.preventDefault()
    }
    function onDrop(event: DragEvent) {
      event.preventDefault()
      const file = event.dataTransfer?.files[0]
      if (file) loadFile(file)
    }
    document.addEventListener("dragover", onDragOver)
    document.addEventListener("drop", onDrop)
    return () => {
      document.removeEventListener("dragover", onDragOver)
      document.removeEventListener("drop", onDrop)
    }
  }, [image, loadFile])

  function reset() {
    setImage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  function recenterAll() {
    setResetKey((k) => k + 1)
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => inputRef.current?.click()}
        >
          {image ? "Nahrát jinou fotku" : "Nahrát fotku"}
        </Button>
        {image ? (
          <>
            <Button variant="secondary" size="md" onClick={recenterAll}>
              Vycentrovat vše
            </Button>
            <Button variant="ghost" size="md" onClick={reset}>
              Začít znovu
            </Button>
            <span className="ml-auto text-[0.8125rem] text-gray-400">
              {image.width} × {image.height} px
            </span>
          </>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {!image ? (
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDropOnZone}
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
            "flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-darker px-6 py-16 text-center transition-colors",
            dragActive
              ? "border-accent bg-card"
              : "border-card hover:border-accent/60",
          )}
        >
          <p className="text-[1.125rem] font-bold text-white">
            Přetáhni sem fotku
          </p>
          <p className="mt-2 text-[0.875rem] text-gray-400">
            nebo klikni a vyber. PNG, JPG, WebP. Klidně tu největší co máš.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {FORMATS.map((format) => (
              <CropCard
                key={format.id}
                format={format}
                image={image}
                resetKey={resetKey}
              />
            ))}
          </div>
          <p className="text-center text-[0.75rem] leading-[1.5] text-gray-500">
            Táhni uvnitř náhledu, zoomuj kolečkem nebo posuvníkem. Stažený výřez
            se ukládá v cílovém rozlišení daného formátu (JPG, kvalita 95).
          </p>
        </>
      )}
    </div>
  )
}

type CropCardProps = {
  format: Format
  image: LoadedImage
  resetKey: number
}

function CropCard({ format, image, resetKey }: CropCardProps) {
  const cropWindowRef = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const stateRef = React.useRef({ offsetX: 0, offsetY: 0, scaleZoom: 1 })
  const [zoomDisplay, setZoomDisplay] = React.useState(100)

  const coverScale = React.useCallback(() => {
    const win = cropWindowRef.current
    if (!win) return 1
    const rect = win.getBoundingClientRect()
    return Math.max(rect.width / image.width, rect.height / image.height)
  }, [image.width, image.height])

  const effectiveScale = React.useCallback(() => {
    return coverScale() * stateRef.current.scaleZoom
  }, [coverScale])

  const clampOffsets = React.useCallback(() => {
    const win = cropWindowRef.current
    if (!win) return
    const rect = win.getBoundingClientRect()
    const s = effectiveScale()
    const imgW = image.width * s
    const imgH = image.height * s
    const minX = rect.width - imgW
    const minY = rect.height - imgH
    stateRef.current.offsetX = Math.max(
      minX,
      Math.min(0, stateRef.current.offsetX),
    )
    stateRef.current.offsetY = Math.max(
      minY,
      Math.min(0, stateRef.current.offsetY),
    )
  }, [effectiveScale, image.width, image.height])

  const render = React.useCallback(() => {
    const img = imgRef.current
    if (!img) return
    clampOffsets()
    const s = effectiveScale()
    img.style.transform = `translate(${stateRef.current.offsetX}px, ${stateRef.current.offsetY}px) scale(${s})`
  }, [clampOffsets, effectiveScale])

  const center = React.useCallback(() => {
    const win = cropWindowRef.current
    if (!win) return
    stateRef.current.scaleZoom = 1
    setZoomDisplay(100)
    const rect = win.getBoundingClientRect()
    const s = effectiveScale()
    const imgW = image.width * s
    const imgH = image.height * s
    stateRef.current.offsetX = (rect.width - imgW) / 2
    stateRef.current.offsetY = (rect.height - imgH) / 2
    render()
  }, [effectiveScale, image.width, image.height, render])

  const setZoom = React.useCallback(
    (newZoom: number) => {
      const win = cropWindowRef.current
      if (!win) return
      const rect = win.getBoundingClientRect()
      const cx = rect.width / 2
      const cy = rect.height / 2
      const oldS = effectiveScale()
      stateRef.current.scaleZoom = newZoom
      const newS = effectiveScale()
      const ratio = newS / oldS
      stateRef.current.offsetX =
        cx - (cx - stateRef.current.offsetX) * ratio
      stateRef.current.offsetY =
        cy - (cy - stateRef.current.offsetY) * ratio
      setZoomDisplay(Math.round(newZoom * 100))
      render()
    },
    [effectiveScale, render],
  )

  React.useLayoutEffect(() => {
    center()
  }, [image.src, resetKey, center])

  React.useEffect(() => {
    const win = cropWindowRef.current
    if (!win) return
    const ro = new ResizeObserver(() => render())
    ro.observe(win)
    return () => ro.disconnect()
  }, [render])

  React.useEffect(() => {
    const win = cropWindowRef.current
    if (!win) return
    function onWheel(event: WheelEvent) {
      event.preventDefault()
      const delta = -event.deltaY * 0.002
      const newZoom = Math.max(
        1,
        Math.min(3, stateRef.current.scaleZoom * (1 + delta)),
      )
      setZoom(newZoom)
    }
    win.addEventListener("wheel", onWheel, { passive: false })
    return () => win.removeEventListener("wheel", onWheel)
  }, [setZoom])

  const dragRef = React.useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffX: 0,
    startOffY: 0,
  })

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const win = cropWindowRef.current
    if (!win) return
    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startOffX: stateRef.current.offsetX,
      startOffY: stateRef.current.offsetY,
    }
    win.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return
    stateRef.current.offsetX =
      dragRef.current.startOffX + (event.clientX - dragRef.current.startX)
    stateRef.current.offsetY =
      dragRef.current.startOffY + (event.clientY - dragRef.current.startY)
    render()
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) return
    dragRef.current.active = false
    try {
      cropWindowRef.current?.releasePointerCapture(event.pointerId)
    } catch {}
  }

  async function download() {
    const win = cropWindowRef.current
    if (!win) return
    const rect = win.getBoundingClientRect()
    const TARGET_LONG = 1350
    let outW: number
    let outH: number
    if (format.ratio >= 1) {
      outW = Math.round(TARGET_LONG)
      outH = Math.round(TARGET_LONG / format.ratio)
    } else {
      outH = Math.round(TARGET_LONG)
      outW = Math.round(TARGET_LONG * format.ratio)
    }
    const s = effectiveScale()
    const srcX = -stateRef.current.offsetX / s
    const srcY = -stateRef.current.offsetY / s
    const srcW = rect.width / s
    const srcH = rect.height / s

    try {
      const probe = new Image()
      await new Promise<void>((resolve, reject) => {
        probe.onload = () => resolve()
        probe.onerror = () => reject(new Error("image load"))
        probe.src = image.src
      })
      const canvas = document.createElement("canvas")
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas not available")
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, outW, outH)
      ctx.drawImage(probe, srcX, srcY, srcW, srcH, 0, 0, outW, outH)
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.95),
      )
      if (!blob) throw new Error("Could not encode JPEG")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      const baseName = image.name.replace(/\.[^.]+$/, "") || "ig"
      link.href = url
      link.download = `${baseName}-${format.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Výřez stažen.")
    } catch (error) {
      console.error(error)
      toast.error("Stažení se nepodařilo.")
    }
  }

  const cropWindow = (
    <div
      ref={cropWindowRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className="relative cursor-grab touch-none select-none overflow-hidden bg-black active:cursor-grabbing"
      style={{ aspectRatio: String(format.ratio) }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={image.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute left-0 top-0 max-w-none origin-top-left"
      />
    </div>
  )

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-card bg-card">
      <div className="flex items-baseline justify-between border-b border-darker px-4 py-3">
        <div className="text-[0.875rem] font-bold text-white">
          {format.name}
        </div>
        <div className="text-[0.6875rem] text-gray-400">{format.desc}</div>
      </div>

      {format.gridPreview ? (
        <div className="grid grid-cols-3 gap-[2px] bg-black p-[2px]">
          <Ghost />
          <Ghost />
          <Ghost />
          <Ghost />
          {cropWindow}
          <Ghost />
          <Ghost />
          <Ghost />
          <Ghost />
        </div>
      ) : (
        cropWindow
      )}

      <div className="flex items-center gap-3 border-t border-darker px-4 py-3">
        <div className="flex flex-1 items-center gap-2 text-[0.6875rem] text-gray-400">
          <span>Zoom</span>
          <input
            type="range"
            min={100}
            max={300}
            step={1}
            value={zoomDisplay}
            onChange={(event) => {
              const next = Number(event.target.value) / 100
              setZoom(next)
            }}
            className="flex-1 accent-accent"
            aria-label="Zoom"
          />
          <span className="w-10 text-right tabular-nums text-white">
            {zoomDisplay} %
          </span>
        </div>
        <button
          type="button"
          onClick={center}
          className="rounded-md bg-darker px-3 py-1.5 text-[0.75rem] font-bold text-gray-400 transition-colors hover:text-white"
        >
          Vystředit
        </button>
        <button
          type="button"
          onClick={download}
          className="rounded-md bg-accent px-3 py-1.5 text-[0.75rem] font-bold text-accent-dark transition-colors hover:bg-accent/90"
        >
          Stáhnout
        </button>
      </div>
    </div>
  )
}

function Ghost() {
  return <div className="aspect-[3/4] bg-darker" />
}
