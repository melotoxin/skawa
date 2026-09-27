import type {Pattern} from '../customDesign'

/**
 * Draws a design pattern over the whole view canvas in view-normalized units, so a pattern
 * looks the same at every preview size. The caller clips it to the garment's pattern area.
 * Mirrors the Design tab swatches (.dl-pattern-* in design-lab.css).
 */
export function drawPattern(ctx: CanvasRenderingContext2D, width: number, height: number, pattern: Pattern, base: string, accent: string) {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = accent
  if (pattern === 'slash') {
    // Bold diagonal bars at the swatch's 125° angle.
    const period = width * 0.11, bar = width * 0.03
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((125 - 90) * Math.PI / 180)
    const reach = Math.hypot(width, height)
    for (let x = -reach; x < reach; x += period) ctx.fillRect(x, -reach, bar, reach * 2)
    ctx.restore()
  }
  if (pattern === 'stripe') {
    ctx.fillRect(width * 0.16, 0, width * 0.08, height)
    ctx.fillRect(width * 0.76, 0, width * 0.08, height)
  }
  if (pattern === 'camo') {
    // Deterministic angular blotches (same seed on every render and on both views).
    const u = width / 1024
    for (let i = 0; i < 90; i++) {
      const x = ((i * 137) % 1024) * u * 1.17 - width * 0.08, y = ((i * 227) % 1024) * (height / 1024)
      ctx.globalAlpha = i % 2 ? 0.38 : 0.82
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 120 * u, y + 20 * u)
      ctx.lineTo(x + 168 * u, y + 78 * u)
      ctx.lineTo(x + 50 * u, y + 120 * u)
      ctx.lineTo(x - 31 * u, y + 44 * u)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }
  if (pattern === 'fade') {
    const gradient = ctx.createLinearGradient(0, height * 0.28, 0, height * 0.8)
    gradient.addColorStop(0, base)
    gradient.addColorStop(1, accent)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
}
