// Genera public/fotos/<id>.jpg con el estudio de la app (npm run dev en el puerto 5199).
// Uso: node scripts/fotos/renderizar.cjs [id ...]   (sin ids: todos los que no tengan foto de Canva)
const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')
const BASE = process.env.BASE ?? 'http://localhost:5199'
const salida = path.join(__dirname, '../../public/fotos')
;(async () => {
  const ids = process.argv.slice(2)
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
  const p = await b.newPage({ viewport: { width: 800, height: 600 } })
  for (const id of ids) {
    if (process.env.SALTAR && fs.existsSync(path.join(salida, `${id}.jpg`))) continue
    try {
      await p.goto(`${BASE}/estudio/${id}`, { waitUntil: 'networkidle' })
      await p.waitForSelector('canvas', { timeout: 8000 })
      await p.waitForTimeout(1200)
      const datos = await p.evaluate(() => document.querySelector('canvas').toDataURL('image/jpeg', 0.84))
      fs.writeFileSync(path.join(salida, `${id}.jpg`), Buffer.from(datos.split(',')[1], 'base64'))
      process.stdout.write(id + ' ')
    } catch {
      process.stdout.write(`(sin foto: ${id}) `)
    }
  }
  await b.close()
})()
