/** Print checks shown as non-blocking hints in the Design Lab. */

/** Below this WCAG contrast ratio, text or a logo is hard to read on the fabric. */
export const MIN_CONTRAST = 2.5
/** Artwork needs this many source pixels per printed pixel (at the 1200 px view width) to stay sharp. */
export const MIN_SHARPNESS = 2
/** Text auto-fitted below this font size (px at the 1200 px view width) prints too small to read at a distance. */
export const MIN_TEXT_PX = 22

const channel = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}
export function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** The palette colour closest to `hex` (for templates limited to fixed colours, like competition gis). */
export function nearestColor(palette: string[], hex: string) {
  const rgb = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16))
  const [r, g, b] = rgb(hex)
  const distance = (h: string) => { const [pr, pg, pb] = rgb(h); return (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2 }
  return palette.reduce((best, h) => distance(h) < distance(best) ? h : best)
}

export type LogoInfo = {width: number; height: number; color: string | null}
/** Pixel size and average opaque colour of uploaded artwork. */
export function analyzeLogo(src: string): Promise<LogoInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 48
      const ctx = canvas.getContext('2d', {willReadFrequently: true})
      let color: string | null = null
      if (ctx) {
        ctx.drawImage(img, 0, 0, 48, 48)
        const data = ctx.getImageData(0, 0, 48, 48).data
        let r = 0, g = 0, b = 0, n = 0
        for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++ }
        if (n) color = '#' + [r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('')
      }
      resolve({width: img.naturalWidth, height: img.naturalHeight, color})
    }
    img.onerror = () => reject(new Error('Artwork could not be decoded'))
    img.src = src
  })
}
