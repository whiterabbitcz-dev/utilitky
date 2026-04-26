# Handoff: IG Crop Preview → utilitky.vercel.app

Port stávající utilitky **Instagram Crop Preview** ze static HTML repa
[`whiterabbitcz-dev/utilitky`](https://github.com/whiterabbitcz-dev/utilitky)
do Next.js appky `utilitky.vercel.app`.

**Live demo (zdroj):** https://whiterabbitcz-dev.github.io/utilitky/ig-crop-preview.html
**Zdroják (1 soubor, vanilla HTML/CSS/JS, 509 řádků):**
[`ig-crop-preview.html`](https://github.com/whiterabbitcz-dev/utilitky/blob/main/ig-crop-preview.html)

---

## Co to dělá

Uživatel nahraje fotku (file input nebo drag & drop kamkoliv na stránku) a vidí
**5 paralelních náhledů** ve všech IG formátech najednou. V každém náhledu může
ořez nezávisle posouvat (drag), zoomovat (scroll wheel + posuvník 100–300 %)
a stáhnout výřez jako JPEG.

### Formáty (pole `FORMATS`)

| ID | Název | Poměr | Cílové rozlišení | Zvláštnost |
|---|---|---|---|---|
| `portrait` | Feed – Portrait | 4:5 | 1080 × 1350 | – |
| `square` | Feed – Square | 1:1 | 1080 × 1080 | – |
| `landscape` | Feed – Landscape | 1.91:1 | 1080 × 566 | – |
| `profile` | Profile Grid | 3:4 | 1015 × 1350 | **Renderuje se jako 9-tile mřížka** s ghost dlaždicemi okolo (středová je live preview). 3:4 je IG 2025 update, neměň to. |
| `story` | Story / Reel | 9:16 | 1080 × 1920 | – |

### Klíčové chování

- **Cover scale:** základní zvětšení tak, aby fotka vždy vyplňovala crop window (žádné černé okraje).
- **Zoom:** uživatelský multiplikátor 1×–3× **nad** cover-scale. Při změně zoomu se drží **bod pod středem** stabilní (ne levý horní roh).
- **Clamp offsetů:** posun je omezen tak, aby fotka pořád pokrývala okno. Nikdy nejde přetáhnout do prázdna.
- **Stáhnout:** vyrenderuje se přes `<canvas>` v cílovém rozlišení (long side 1350 px), JPEG kvalita 0.95, název `ig-{format-id}.jpg`.
- **Vycentrovat vše** (header tlačítko) resetuje zoom na 100 % a vycentruje fotku ve všech 5 kartách.
- **Drag & drop** funguje jak na dropzóně, tak kdekoliv na `<body>` (jakmile je fotka načtená, dropzóna se schová).

### Veškerá logika je client-side

Fotka nikdy neopouští browser. Žádný backend, žádný upload. To je důležité claim,
stejně jako u Story safe zone.

---

## Kam to dát v Next.js appce

### 1. Nová route `/ig-crop-preview`

Po vzoru `/story-safe-zone`: `app/ig-crop-preview/page.tsx` (případně + client komponenta,
protože všechno je interaktivní DOM/canvas, takže bude potřeba `"use client"`).

### 2. Karta na homepage

V sekci **ŽIVĚ** přidat druhou dlaždici vedle Story safe zone, stejný styl:

```tsx
<a
  href="/ig-crop-preview"
  className="relative block bg-card p-6 border-l-4 border-accent rounded-l-none rounded-r-[12px] transition-transform hover:-translate-y-0.5"
>
  <span className="absolute right-4 top-4 text-[0.75rem] font-bold tracking-caps text-accent">
    ŽIVĚ
  </span>
  <h3 className="text-[1.125rem] font-bold text-white">IG crop preview</h3>
  <p className="mt-2 text-[0.875rem] leading-[1.5] text-gray-400">
    Nahraj fotku a uvidíš ji ve všech IG formátech najednou. Posouvej, zoomuj, stahuj.
  </p>
</a>
```

Z BRZY sekce **nemaž nic**. IG crop je něco jiného než „Multi formát exporter" (ten exportuje 1:1
do víc poměrů, tohle je interaktivní preview s ručním ořezem).

### 3. Popis stránky (meta)

- `title`: `IG crop preview | White Rabbit`
- `description`: `Nahraj fotku a uvidíš ji ve všech Instagram formátech najednou: feed, profil, story. Ořez si srovnáš ručně a stáhneš.`

---

## Implementační poznámky

### Stack & styling

Drž se WR design tokenů z appky (`bg-bg`, `bg-card`, `bg-darker`, `text-accent`,
`tracking-caps`, atd.). **Nepoužívej** ty růžovo-fialové gradienty z původního static HTML
— ty jsou z GitHub Pages verze a nesedí s WR identitou. Akcent ve Vercel appce je tyrkysová
(`#00E5FF` podle Toaster border ve zdrojáku) → `text-accent` / `border-accent`.

Header utilitky může mít stejný `<header>` jako homepage (sticky, WR logo, link na changelog),
do něj přidej tlačítka **„Načíst fotku"** a **„Vycentrovat vše"**.

### Typové formáty

```ts
type Format = {
  id: 'portrait' | 'square' | 'landscape' | 'profile' | 'story';
  name: string;
  ratio: number;
  desc: string;
  gridPreview?: boolean;
};
```

### Refs a state

Pět crop windows × per-card state (`offsetX`, `offsetY`, `scaleZoom`). Doporučuju
jednu komponentu `<CropCard format={...} image={...} />` co si state drží lokálně,
plus parent drží `image: HTMLImageElement | null` a propaguje ho dolů.

Pro reset všech najednou prostě bumpni `resetKey` v parentu nebo dej ref imperativ —
co se ti líp ladí v React.

### Pointer events

Originál používá `pointerdown/move/up` s `setPointerCapture` — to v Reactu funguje
přes `onPointerDown` atd. **Nepoužívej** mouse + touch separátně, jeden Pointer events
handler pokrývá oboje.

### Wheel zoom

```js
ctx.cropWindow.addEventListener('wheel', e => {...}, { passive: false });
```

V Reactu **`onWheel` je passive** → `e.preventDefault()` nebude fungovat. Buď použij
`useEffect` + `addEventListener('wheel', ..., { passive: false })`, nebo nech wheel-zoom
být a stačí slider. Doporučuju první variantu, je to citelně lepší UX.

### Canvas download

```js
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ig-${format.id}.jpg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}, 'image/jpeg', 0.95);
```

Pozor: source rect počítej z **aktuálního `getBoundingClientRect()`** crop window, ne
z předpokládané velikosti — náhled je responzivní.

### Resize

Při změně velikosti okna se `coverScale` mění → zavolej `render` na všech kartách.
Originál to dělá přes `window.addEventListener('resize', ...)`. V Reactu `useEffect` +
`ResizeObserver` na crop window.

### Mobile

Static verze funguje na mobilu (touch-action: none, pointer events). V port verzi
zachovat `touch-action: none` na crop window CSS, jinak browser zachytí scroll
gesto.

---

## Acceptance kritéria

- [ ] Karta „IG crop preview" je v sekci ŽIVĚ na homepage, vedle Story safe zone
- [ ] `/ig-crop-preview` má 5 náhledů v gridu (auto-fit, min 260px)
- [ ] Profile Grid má **3×3 mřížku s 8 ghost dlaždicemi** kolem živého náhledu (3:4 poměr)
- [ ] Drag posouvá fotku, clamp drží fotku pokrytou (žádné černé okraje při puštění)
- [ ] Slider 100–300 % zoomuje k centru
- [ ] Wheel zoom funguje (ne stránkový scroll)
- [ ] „Centrovat" v kartě a „Vycentrovat vše" v headeru fungují
- [ ] „Stáhnout" v kartě uloží JPEG v cílovém rozlišení (1350 long-side, q=0.95)
- [ ] Drag & drop kamkoliv na stránku načte fotku
- [ ] Funguje na touch (iOS Safari, Android Chrome)
- [ ] WR styling (žádné gradienty z GH Pages verze, jen `text-accent`/`bg-card`/`bg-bg`)

---

## Co (zatím) nedělat

- Žádné cropování přes server
- Žádný upload
- Žádné účty / persistence — fotka se po reloadu zahodí, to je OK
- Nepřidávat víc formátů než těchto 5 (FB, X, LinkedIn… to je další utilitka)
