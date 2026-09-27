/**
 * 2D font stacks for the stored Design.font values (3D keeps the stored value as is).
 * Anton comes from the Google Fonts link in index.html; the rest are system fonts.
 */
const FONTS: Record<string, {stack: string; weight: number; load?: string}> = {
  Impact: {stack: "'Anton', Impact, 'Arial Narrow', sans-serif", weight: 400, load: "400 64px 'Anton'"},
  Arial: {stack: "Arial, 'Helvetica Neue', sans-serif", weight: 700},
  Georgia: {stack: "Georgia, 'Times New Roman', serif", weight: 700},
  monospace: {stack: "ui-monospace, 'SFMono-Regular', Menlo, monospace", weight: 700},
}
export const font2d = (font: string) => FONTS[font] ?? FONTS.Arial

let measurer: CanvasRenderingContext2D | null = null
/** Width of a line of text per unit of font size, in its 2D font. */
export function textRatio(text: string, font: string) {
  const spec = font2d(font)
  measurer ??= document.createElement('canvas').getContext('2d')
  if (!measurer) return text.length * 0.58
  measurer.font = `${spec.weight} 100px ${spec.stack}`
  return measurer.measureText(text).width / 100
}

/** Resolves once the font can render (or after a timeout, so a blocked font never stalls the preview). */
export function ensureFont(font: string): Promise<void> {
  const spec = font2d(font).load
  if (!spec || typeof document === 'undefined' || !document.fonts) return Promise.resolve()
  if (document.fonts.check(spec)) return Promise.resolve()
  const load = async () => {
    await document.fonts.load(spec)
    // The stylesheet may still be arriving: wait for it, then ask again.
    if (!document.fonts.check(spec)) { await document.fonts.ready; await document.fonts.load(spec) }
  }
  return Promise.race([load().catch(() => {}), new Promise<void>(resolve => setTimeout(resolve, 3000))])
}
