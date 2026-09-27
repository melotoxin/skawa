import type {Product} from '../../types'
import type {Design} from '../customDesign'
import {composeInput, placeAll, shownColor} from './art'
import {composeView, loadImage, loadView} from './compose'
import {ensureFont} from './fonts'
import type {Template2D, ViewSide} from './types'

export const DISCLAIMER = 'Design concept — final fit, colour and print placement subject to production approval.'
type Sheet = {product: Product; design: Design; designId?: string}

const VIEW = [1200, 1500], M = 80, TOP = 300, FOOT = 190, MIN_WIDTH = 2000
const INK = '#161616', MUTED = '#66665f', PAPER = '#f1f1ef'
const DISPLAY = "'Barlow Condensed', Impact, 'Arial Narrow', sans-serif", BODY = "Inter, Arial, sans-serif"

async function fonts() {
  if (!document.fonts) return
  await Promise.race([Promise.all([document.fonts.load(`800 60px ${DISPLAY}`), document.fonts.load(`600 26px ${BODY}`), document.fonts.load(`400 24px ${BODY}`)]).catch(() => {}), new Promise(r => setTimeout(r, 2500))])
}

/** Blank sheet with the SKAWA header, product, design ID and specification line; `x(i)` is where view i starts. */
function sheet({product, design, designId}: Sheet, views: number, colors: {label: string; hex: string}[], view = VIEW) {
  const row = view[0] * views + M * (views - 1)
  const width = Math.max(MIN_WIDTH, M * 2 + row), height = TOP + view[1] + FOOT
  const x = (i: number) => (width - row) / 2 + i * (view[0] + M)
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, width, height)
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK; ctx.font = `800 40px ${DISPLAY}`; ctx.fillText('SKAWA FIGHT · DESIGN PROOF', M, 92)
  ctx.textAlign = 'right'; ctx.font = `600 26px ${BODY}`; ctx.fillStyle = designId ? INK : MUTED
  ctx.fillText(designId ? `Design ${designId}` : 'Unsaved design', width - M, 90)
  ctx.font = `400 22px ${BODY}`; ctx.fillStyle = MUTED; ctx.fillText(new Date().toISOString().slice(0, 10), width - M, 124)
  ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = `800 76px ${DISPLAY}`; ctx.fillText(product.name.toUpperCase(), M, 186)
  // Specification line: colour chips, then pattern, fabric and method (wraps onto a second line when needed).
  let cx = M, y = 246
  ctx.font = `600 24px ${BODY}`
  for (const {label, hex} of colors) {
    ctx.beginPath(); ctx.arc(cx + 14, y - 8, 14, 0, Math.PI * 2); ctx.fillStyle = hex; ctx.fill()
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.stroke()
    ctx.fillStyle = INK; const text = `${label} ${hex.toUpperCase()}`; ctx.fillText(text, cx + 38, y); cx += 38 + ctx.measureText(text).width + 36
  }
  ctx.fillStyle = MUTED; ctx.font = `400 24px ${BODY}`
  const pattern = design.pattern !== 'solid' && colors.some(c => c.label === 'Accent') ? `${design.pattern[0].toUpperCase()}${design.pattern.slice(1)} pattern` : ''
  const specs = [pattern, design.material, design.print].filter(Boolean).join(' · ')
  if (cx + ctx.measureText(specs).width > width - M) { cx = M; y += 38 }
  ctx.fillText(specs, cx, y)
  return {canvas, ctx, width, height, x}
}

function footer(ctx: CanvasRenderingContext2D, width: number, height: number, captions: {x: number; text: string}[], note?: string) {
  ctx.fillStyle = INK; ctx.font = `800 26px ${BODY}`; ctx.textAlign = 'center'
  for (const {x, text} of captions) ctx.fillText(text.toUpperCase(), x, height - FOOT + 48)
  ctx.textAlign = 'left'; ctx.fillStyle = MUTED; ctx.font = `400 22px ${BODY}`
  if (note) ctx.fillText(note, M, height - 84)
  ctx.fillText(DISCLAIMER, M, height - 46)
}

const toBlob = (canvas: HTMLCanvasElement) => new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Export failed')), 'image/png'))

/** Union of the views' garment outlines (normalized, with a small margin), so the sheet isn't mostly empty stage. */
function contentBox(views: {silhouette: HTMLImageElement}[]) {
  const [w, h] = [240, 300], probe = document.createElement('canvas')
  probe.width = w; probe.height = h
  const ctx = probe.getContext('2d', {willReadFrequently: true})!
  for (const view of views) ctx.drawImage(view.silhouette, 0, 0, w, h)
  const data = ctx.getImageData(0, 0, w, h).data
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y) }
  if (x1 < x0) return {x: 0, y: 0, w: 1, h: 1}
  const pad = 0.03, left = Math.max(0, x0 / w - pad), top = Math.max(0, y0 / h - pad)
  return {x: left, y: top, w: Math.min(1, (x1 + 1) / w + pad) - left, h: Math.min(1, (y1 + 1) / h + pad) - top}
}

/** Full-colour proof: both views composed with the same renderer and inputs as the on-screen proof. */
export async function exportTemplated(template: Template2D, info: Sheet) {
  const {design} = info
  await Promise.all([fonts(), ensureFont(design.font)])
  const sides: ViewSide[] = template.views.back ? ['front', 'back'] : ['front']
  const [views, logo] = await Promise.all([Promise.all(sides.map(side => loadView(template, side))), design.logo ? loadImage(design.logo) : Promise.resolve(null)])
  const placed = placeAll(template, design, logo)
  const colors = [
    template.supports.baseColor && {label: 'Base', hex: shownColor(template, design.color)},
    template.supports.trim && {label: 'Trim', hex: shownColor(template, design.trim)},
    template.supports.pattern && template.supports.accent && design.pattern !== 'solid' && {label: 'Accent', hex: design.accent},
  ].filter((c): c is {label: string; hex: string} => Boolean(c))
  const [W, H] = template.size, crop = contentBox(views)
  const size = [Math.round(crop.w * W), Math.round(crop.h * H)]
  const {canvas, ctx, width, height, x} = sheet(info, sides.length, colors, size)
  const captions = sides.map((side, i) => {
    const view = document.createElement('canvas')
    composeView(views[i], composeInput(template, design, placed.filter(p => p.instance.side === side)), view, 1)
    ctx.drawImage(view, crop.x * W, crop.y * H, size[0], size[1], x(i), TOP, size[0], size[1])
    return {x: x(i) + size[0] / 2, text: sides.length === 1 ? 'front only' : side}
  })
  footer(ctx, width, height, captions)
  return toBlob(canvas)
}

/** Photo-preview proof: the clean catalog photo with the artwork overlays, plus the chosen colours as chips. */
export async function exportPhoto(info: Sheet) {
  const {product, design} = info
  await fonts()
  const single = !product.secondaryImage || product.secondaryImage === product.image
  const sides: ViewSide[] = single ? ['front'] : ['front', 'back']
  const [photos, logo] = await Promise.all([Promise.all(sides.map(side => loadImage(side === 'front' ? product.image : product.secondaryImage))), design.logo ? loadImage(design.logo) : Promise.resolve(null)])
  const colors = [{label: 'Base', hex: design.color}, {label: 'Trim', hex: design.trim}, {label: 'Accent', hex: design.accent}]
  const {canvas, ctx, width, height, x} = sheet(info, sides.length, colors)
  const mirrorText = design.mirrorText ?? design.mirrorArt ?? false, mirrorLogo = design.mirrorLogo ?? design.mirrorArt ?? false
  const captions = sides.map((side, i) => {
    const photo = photos[i], x0 = x(i)
    // Same fit and overlay rules as the on-screen photo preview (PhotoSide in Customizer.tsx).
    const scale = Math.min(VIEW[0] / photo.naturalWidth, VIEW[1] / photo.naturalHeight)
    const w = photo.naturalWidth * scale, h = photo.naturalHeight * scale, left = x0 + (VIEW[0] - w) / 2, top = TOP + (VIEW[1] - h) / 2
    ctx.drawImage(photo, left, top, w, h)
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, w, h); ctx.clip()
    const mark = design.logoPlacement, text = design.textPlacement
    if (logo && (mirrorLogo || mark.side === side)) {
      const lw = mark.size / 100 * w, lh = lw * logo.naturalHeight / Math.max(1, logo.naturalWidth)
      ctx.save(); ctx.translate(left + mark.x / 100 * w, top + mark.y / 100 * h); ctx.rotate(mark.rotation * Math.PI / 180); ctx.drawImage(logo, -lw / 2, -lh / 2, lw, lh); ctx.restore()
    }
    if (design.text && (mirrorText || text.side === side)) {
      ctx.save(); ctx.translate(left + text.x / 100 * w, top + text.y / 100 * h); ctx.rotate(text.rotation * Math.PI / 180)
      ctx.fillStyle = design.textColor; ctx.font = `800 ${text.size * 0.78 / 100 * w}px ${design.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(design.text, 0, 0); ctx.restore()
    }
    ctx.restore()
    return {x: x0 + VIEW[0] / 2, text: single ? 'front · back view not available yet' : side}
  })
  footer(ctx, width, height, captions, 'Photo preview — colours and patterns appear on your production proof.')
  return toBlob(canvas)
}
