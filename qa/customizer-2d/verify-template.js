// In-browser verification for a 2D template (run on the Vite dev server, e.g. from the DevTools console):
//   const {verifyTemplate} = await import('/qa/customizer-2d/verify-template.js'); await verifyTemplate('fight-short')
// Each control must change pixels, and only inside its own region. Returns one row per view.
export async function verifyTemplate(slug) {
  const m = await import('/src/lib/customizer2d/compose.ts')
  const t = await import('/src/lib/customizer2d/templates.ts')
  const pl = await import('/src/lib/customizer2d/placement.ts')
  const f = await import('/src/lib/customizer2d/fonts.ts')
  const tpl = t.getTemplate(slug)
  if (!tpl) throw new Error(`No template for ${slug}`)
  const [W, H] = tpl.size
  const px = img => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H); return x.getImageData(0, 0, W, H).data }
  const logoCanvas = document.createElement('canvas'); logoCanvas.width = logoCanvas.height = 400
  const g = logoCanvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(40, 40, 320, 320)
  const logo = await m.loadImage(logoCanvas.toDataURL())
  const spec = f.font2d('Impact'); await f.ensureFont('Impact')
  const rows = []
  for (const side of tpl.views.back ? ['front', 'back'] : ['front']) {
    const v = await m.loadView(tpl, side)
    const body = px(v.body), trim = v.trim ? px(v.trim) : null, pattern = v.pattern ? px(v.pattern) : null
    const base = {color: '#174d79', trim: '#080808', accent: '#df202b', pattern: 'solid', use: {baseColor: tpl.supports.baseColor, trim: tpl.supports.trim, pattern: tpl.supports.pattern && tpl.supports.accent}, art: [], sheen: tpl.sheen}
    const render = o => { const c = document.createElement('canvas'); m.composeView(v, {...base, ...o}, c, 1); return c.getContext('2d').getImageData(0, 0, W, H).data }
    const ref = render({})
    const diff = (data, allowed) => { let inside = 0, outside = 0; for (let i = 0; i < data.length; i += 4) if (data[i] !== ref[i] || data[i + 1] !== ref[i + 1] || data[i + 2] !== ref[i + 2] || data[i + 3] !== ref[i + 3]) allowed(i) ? inside++ : outside++; return {inside, outside} }
    const fabric = i => body[i + 3] > 0 || (trim && trim[i + 3] > 0)
    const row = {slug, template: tpl.id, side}
    const check = (name, supported, data, allowed) => { if (!supported) { row[name] = 'n/a'; return } const d = diff(data, allowed); row[name] = d.inside > 50 && d.outside === 0 ? `pass (${d.inside})` : `FAIL in ${d.inside} out ${d.outside}` }
    check('baseColor', tpl.supports.baseColor, render({color: '#d1a021'}), i => body[i + 3] > 0)
    check('trim', tpl.supports.trim && !!trim, render({trim: '#d1a021'}), i => trim[i + 3] > 0)
    check('pattern', tpl.supports.pattern && !!pattern, render({pattern: 'stripe'}), i => pattern[i + 3] > 0 && body[i + 3] > 0)
    const slash = tpl.supports.pattern && pattern ? render({pattern: 'slash'}) : null
    if (slash) { const again = render({pattern: 'slash', accent: '#16612c'}); let inside = 0, outside = 0; for (let i = 0; i < again.length; i += 4) if (again[i] !== slash[i] || again[i + 1] !== slash[i + 1] || again[i + 2] !== slash[i + 2]) (pattern[i + 3] > 0 && body[i + 3] > 0) ? inside++ : outside++; row.accent = inside > 50 && outside === 0 ? `pass (${inside})` : `FAIL in ${inside} out ${outside}` } else row.accent = 'n/a'
    for (const kind of ['text', 'logo']) {
      const zones = pl.zonesOn(tpl, side).filter(z => z.accepts.includes(kind))
      if (!tpl.supports[kind] || !zones.length) { row[kind] = 'n/a'; continue }
      const results = zones.map(zone => {
        const inZone = document.createElement('canvas'); inZone.width = W; inZone.height = H
        const zx = inZone.getContext('2d'); zx.beginPath(); zone.polygon.forEach(([x, y], i) => i ? zx.lineTo(x * W, y * H) : zx.moveTo(x * W, y * H)); zx.closePath(); zx.fill()
        const zm = zx.getImageData(0, 0, W, H).data
        const content = kind === 'text' ? {kind, ratio: f.textRatio('SILVA 07', 'Impact')} : {kind, ratio: 1}
        const box = pl.artBox(zone, content, 1, 0, tpl.aspect), [x, y] = pl.centreOf(zone, 0.5, 0.5, box)
        const item = kind === 'text'
          ? {kind, text: 'SILVA 07', font: spec.stack, weight: spec.weight, color: '#ffffff', x, y, size: box.size, maxWidth: zone.maxWidth, rotation: 0, clip: zone.polygon}
          : {kind, image: logo, x, y, width: box.w, rotation: 0, clip: zone.polygon}
        const d = diff(render({art: [item]}), i => zm[i + 3] > 0 && fabric(i))
        return d.inside > 50 && d.outside === 0 ? null : `${zone.id}: in ${d.inside} out ${d.outside}`
      }).filter(Boolean)
      row[kind] = results.length ? `FAIL ${results.join('; ')}` : `pass (${zones.length} zones)`
    }
    rows.push(row)
  }
  return rows
}
