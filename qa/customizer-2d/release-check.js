// Release gate for the 2D Design Lab. Run on /customize in the Vite dev server (DevTools console):
//   const {runReleaseCheck} = await import('/qa/customizer-2d/release-check.js'); const report = await runReleaseCheck()
// Drives the real UI for every customizable product in 2D mode and returns one row per product.
// Cells: 'pass', 'n/a' (the product doesn't offer it), or 'FAIL: reason'.
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const $ = (selector, root = document) => root.querySelector(selector)
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)]
const setSelect = (el, value) => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('change', {bubbles: true})) }
const setInput = (el, value) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value); el.dispatchEvent(new Event('input', {bubbles: true})) }
const tab = async name => { $(`#dl-tab-${name}`).click(); await wait(120); return $(`#dl-panel-${name}`) }
const labels = () => $$('.dl-proof2d canvas').map(c => c.getAttribute('aria-label') || '')
async function settle() { for (let i = 0; i < 40; i++) { if (!labels().some(l => l.startsWith('Loading'))) return; await wait(100) } }
const saved = () => JSON.parse(localStorage.getItem('skawa-designs') || '[]').at(-1)
const pointer = (type, el, x, y) => el.dispatchEvent(new PointerEvent(type, {bubbles: true, clientX: x, clientY: y, pointerId: 7, pointerType: 'mouse', isPrimary: true, button: 0}))

export async function runReleaseCheck() {
  const {products} = await import('/src/data.ts')
  const {templateIdFor, getTemplate} = await import('/src/lib/customizer2d/templates.ts')
  const {isDesign} = await import('/src/lib/customDesign.ts')
  const {verifyTemplate} = await import('/qa/customizer-2d/verify-template.js')
  const {exportTemplated, exportPhoto} = await import('/src/lib/customizer2d/export.ts')
  const {findZone} = await import('/src/lib/customizer2d/placement.ts')
  const twoD = $$('button').find(b => b.textContent === '2D'); twoD?.click(); await wait(200)
  const logoFile = await new Promise(resolve => { const c = document.createElement('canvas'); c.width = c.height = 800; const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(400, 400, 380, 0, 7); g.fill(); g.fillStyle = '#151515'; g.font = 'bold 480px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('S', 400, 430); c.toBlob(b => resolve(new File([b], 'qa-logo.png', {type: 'image/png'})), 'image/png') })
  const regions = {}
  const rows = []
  for (const product of products.filter(p => p.custom)) {
    const row = {product: product.name}
    const fail = (key, reason) => { row[key] = `FAIL: ${reason}` }
    try {
      const productPanel = await tab('Product')
      setSelect($('select', productPanel), String(product.id)); await wait(300); await settle()
      const id = templateIdFor(product.slug), template = id && getTemplate(product.slug)
      row.preview = template ? `full colour (${id})` : 'photo preview'
      const views = template ? (template.views.back ? 2 : 1) : $$('.dl-flat--pair figure').length
      row.views = views === 2 ? 'front+back' : 'front'
      // Colour, pattern, text and logo effects.
      if (template) {
        regions[id] ??= await verifyTemplate(product.slug)
        for (const key of ['baseColor', 'trim', 'accent', 'pattern', 'text', 'logo']) {
          const cells = regions[id].map(r => r[key])
          row[key] = cells.every(c => c === 'n/a') ? 'n/a' : cells.some(c => c.startsWith('FAIL')) ? `FAIL: ${cells.join(' / ')}` : 'pass'
        }
      } else {
        const chip = name => $$('.dl-photo-preview li').find(li => li.textContent.startsWith(name))?.textContent || ''
        $('[aria-label="Base color #16612c"]')?.click(); await wait(80)
        row.baseColor = chip('Base').includes('#16612C') ? 'pass (chip)' : 'FAIL: base chip not updated'
        $('[aria-label="Trim color #d1a021"]')?.click(); await wait(80)
        row.trim = chip('Trim').includes('#D1A021') ? 'pass (chip)' : 'FAIL: trim chip not updated'
        await tab('Design'); $('[aria-label="Accent color #174d79"]')?.click(); $$('.dl-patterns button').find(b => b.textContent.includes('camo'))?.click(); await wait(80)
        row.accent = chip('Accent').includes('#174D79') ? 'pass (chip)' : 'FAIL: accent chip not updated'
        row.pattern = $('.dl-photo-preview__pattern')?.textContent.includes('camo') ? 'pass (chip)' : 'FAIL: pattern chip missing'
      }
      // Text and logo through the real inputs.
      const textPanel = await tab('Text')
      if ($('[aria-label="Personalization text"]', textPanel)) { setInput($('[aria-label="Personalization text"]', textPanel), 'SILVA 07'); await wait(150) }
      if (!template) row.text = $$('.dl-photo__text').some(t => t.textContent === 'SILVA 07') ? 'pass (overlay)' : 'FAIL: text overlay missing'
      const logoPanel = await tab('Logos')
      const upload = $('[aria-label="Upload logo"]', logoPanel)
      if (upload && !$('.dl-logo-file', logoPanel)) { const dt = new DataTransfer(); dt.items.add(logoFile); upload.files = dt.files; upload.dispatchEvent(new Event('change', {bubbles: true})); await wait(900) }
      if (!template) row.logo = $$('.dl-photo__logo').length ? 'pass (overlay)' : 'FAIL: logo overlay missing'
      else if (row.logo === 'pass' && !labels().some(l => l.includes('logo on'))) fail('logo', 'logo not printed on the proof')
      // Zone change: every zone that accepts text.
      await tab('Text')
      const zoneSelect = $('[aria-label="Text placement zone"]')
      if (zoneSelect) {
        const problems = []
        for (const option of [...zoneSelect.options]) {
          setSelect($('[aria-label="Text placement zone"]'), option.value); await wait(120)
          const [side, zoneId] = option.value.split(':'), zone = findZone(template, side, zoneId)
          if (!labels().some(l => l.includes(`on the ${zone.label.toLowerCase()}`))) problems.push(option.value)
        }
        row.zoneChange = problems.length ? `FAIL: ${problems.join(', ')}` : `pass (${zoneSelect.options.length} zones)`
      } else row.zoneChange = template ? 'FAIL: no zone select' : 'n/a (shared placement: side + sliders)'
      // Cross-view drag: grab the name on the front, drop it on the back view.
      if (views === 2) {
        const panelTab = await tab('Text')
        if (zoneSelect) setSelect($('[aria-label="Text placement zone"]'), [...$('[aria-label="Text placement zone"]').options].find(o => o.value.startsWith('front:')).value)
        else setSelect($$('.dl-placement select', panelTab).find(s => [...s.options].some(o => o.value === 'back')), 'front')
        await wait(250)
        const frame = template ? $$('.dl-proof2d__select')[0] : $('.dl-art-frame--text')
        const surfaces = template ? $$('.dl-proof2d canvas') : $$('.dl-photo__shot')
        if (frame && surfaces.length === 2) {
          const from = frame.getBoundingClientRect(), to = surfaces[1].getBoundingClientRect()
          const [fx, fy] = [from.left + from.width / 2, from.top + from.height / 2]
          pointer('pointerdown', surfaces[0], fx, fy); await wait(30)
          pointer('pointermove', surfaces[1], to.left + to.width * 0.5, to.top + to.height * 0.4); await wait(60)
          pointer('pointerup', surfaces[1], to.left + to.width * 0.5, to.top + to.height * 0.4); await wait(200)
          const side = template ? $('[aria-label="Text placement zone"]').value.split(':')[0] : $$('.dl-placement select').find(s => [...s.options].some(o => o.value === 'back')).value
          row.crossViewDrag = side === 'back' ? 'pass' : `FAIL: still on ${side}`
        } else row.crossViewDrag = 'FAIL: artwork frame not found'
      } else row.crossViewDrag = 'n/a (front view only)'
      // Mirror ("Show on both sides").
      if (views === 2) {
        const box = $('.dl-placement .dl-check input')
        if (box && !box.disabled) {
          box.click(); await wait(200)
          const both = template ? labels().every(l => l.includes('SILVA 07')) : $$('.dl-photo__text').length === 2
          row.mirror = both ? 'pass' : 'FAIL: not shown on both views'
          $('.dl-placement .dl-check input').click(); await wait(120)
        } else row.mirror = 'n/a (zone has no counterpart)'
      } else row.mirror = 'n/a (front view only)'
      // Undo / redo.
      await tab('Product')
      const before = $('#dl-panel-Product .dl-colors small')?.textContent
      ;[...$$('#dl-panel-Product .dl-colors')[0].querySelectorAll('button')].find(button => button.getAttribute('aria-pressed') !== 'true').click(); await wait(80)
      const changed = $('#dl-panel-Product .dl-colors small')?.textContent
      $('[aria-label="Undo design change"]').click(); await wait(80)
      const undone = $('#dl-panel-Product .dl-colors small')?.textContent
      $('[aria-label="Redo design change"]').click(); await wait(80)
      const redone = $('#dl-panel-Product .dl-colors small')?.textContent
      row.undoRedo = changed !== before && undone === before && redone === changed ? 'pass' : `FAIL: ${before} → ${changed} → undo ${undone} → redo ${redone}`
      // Save, reload record, export/import JSON, download PNG.
      $$('button').find(b => /SAVE DESIGN|DESIGN SAVED/.test(b.textContent)).click(); await wait(200)
      const record = saved()
      row.save = record && record.productId === product.id && isDesign(record) ? 'pass' : 'FAIL: saved record invalid'
      row.reload = record && isDesign(JSON.parse(JSON.stringify(record))) ? 'pass (record valid; full reload spot-checked separately)' : 'FAIL'
      const {id: _id, product: _p, savedAt: _s, ...exported} = record
      row.jsonExportImport = isDesign(JSON.parse(JSON.stringify(exported))) ? 'pass' : 'FAIL: exported JSON rejected'
      const info = {product, design: record, designId: record.id}
      const blob = template ? await exportTemplated(template, info) : await exportPhoto(info)
      row.downloadPng = blob.size > 50000 ? `pass (${Math.round(blob.size / 1024)} KB)` : `FAIL: ${blob.size} bytes`
      // Tidy up for the next product: remove the logo.
      await tab('Logos'); $('[aria-label="Remove logo"]')?.click(); await wait(80)
    } catch (error) { row.error = String(error) }
    rows.push(row)
  }
  return rows
}
