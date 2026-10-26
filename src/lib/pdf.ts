import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { MATERIALES } from '../core/catalogo'
import { DIFICULTAD, cm, formatoCLP } from '../core/costos'
import { precioFabricacion, type Tienda } from '../core/tiendas'
import type { ProyectoDef } from '../core/types'
import type { Calculo } from './useCalculo'

interface Capturas {
  general?: string
  /** Una imagen por paso de la guía (puede faltar alguna). */
  pasos: (string | undefined)[]
}

const MARGEN = 15
const CAFE: [number, number, number] = [138, 90, 43]

function finalY(doc: jsPDF): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

function titulo(doc: jsPDF, texto: string, y: number) {
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...CAFE).text(texto, MARGEN, y)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(40)
}

/** Imagen ajustada al ancho disponible sin pasar el alto máximo. */
function imagen(doc: jsPDF, dataUrl: string, y: number, altoMax: number): number {
  const props = doc.getImageProperties(dataUrl)
  const anchoDisp = doc.internal.pageSize.getWidth() - 2 * MARGEN
  let w = anchoDisp
  let h = (props.height / props.width) * w
  if (h > altoMax) {
    h = altoMax
    w = (props.width / props.height) * h
  }
  doc.addImage(dataUrl, 'JPEG', MARGEN + (anchoDisp - w) / 2, y, w, h)
  return y + h
}

/** Recuadro «¿Prefieres que te lo hagan?»: cada plano que circula lleva a las tiendas. */
function recuadroTiendas(doc: jsPDF, tiendas: Tienda[], costoMateriales: number, enlace: string) {
  const ancho = doc.internal.pageSize.getWidth() - 2 * MARGEN
  const y = doc.internal.pageSize.getHeight() - 56
  doc.setDrawColor(224, 138, 46).setFillColor(253, 240, 222).roundedRect(MARGEN, y, ancho, 40, 3, 3, 'FD')
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...CAFE).text('¿Prefieres que te lo hagan?', MARGEN + 6, y + 9)
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(40)
  doc.text(`Te lo fabricamos a esta medida desde ${formatoCLP(precioFabricacion(costoMateriales, tiendas))} aprox. Pide tu cotización a:`, MARGEN + 6, y + 16)
  tiendas.forEach((t, i) => {
    doc.setFont('helvetica', 'bold').text(t.nombre, MARGEN + 6, y + 23 + i * 5.5)
    if (t.whatsapp) doc.setFont('helvetica', 'normal').text(`WhatsApp +${t.whatsapp}`, MARGEN + 70, y + 23 + i * 5.5)
  })
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(110)
  doc.text(doc.splitTextToSize(`O desde el botón «¿No quieres hacerlo tú?» en ${enlace}`, ancho - 12), MARGEN + 6, y + 36)
}

export function generarPdf(proyecto: ProyectoDef, calc: Calculo, capturas: Capturas, enlace: string, tiendas: Tienda[]): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const anchoPag = doc.internal.pageSize.getWidth()
  const altoPag = doc.internal.pageSize.getHeight()
  const { res, cortes, opt, costos, letras } = calc
  const [W, H, D] = res.exterior

  // Portada
  doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(...CAFE).text(proyecto.nombre, MARGEN, 25)
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(60)
  doc.text(`Medidas exteriores: ${cm(W)} × ${cm(H)} × ${cm(D)} cm (ancho × alto × fondo)`, MARGEN, 33)
  doc.text(`Dificultad: ${DIFICULTAD[proyecto.dificultad - 1]}  ·  Tiempo: ${proyecto.horas}  ·  Materiales: ${formatoCLP(costos.total)} aprox.`, MARGEN, 39)
  let y = 46
  if (capturas.general) y = imagen(doc, capturas.general, y, 140) + 6
  if (res.avisos.length) {
    titulo(doc, 'Ten en cuenta', y + 4)
    y += 10
    for (const a of res.avisos) {
      const lineas = doc.splitTextToSize(`- ${a}`, anchoPag - 2 * MARGEN)
      doc.text(lineas, MARGEN, y)
      y += lineas.length * 5
    }
  }
  titulo(doc, 'Herramientas', y + 6)
  doc.text(doc.splitTextToSize(proyecto.herramientas.join(', ') + '.', anchoPag - 2 * MARGEN), MARGEN, y + 12)
  recuadroTiendas(doc, tiendas, costos.total, enlace)

  // Lista de corte
  doc.addPage()
  titulo(doc, 'Lista de corte', 20)
  autoTable(doc, {
    startY: 25,
    head: [['Pieza', 'Nombre', 'Cant.', 'Largo cm', 'Ancho cm', 'Esp. mm', 'Material', 'Tapacanto']],
    body: cortes.map((c) => [
      c.letra,
      c.nombre + (c.veta ? ' (veta)' : ''),
      c.cantidad,
      cm(c.largo),
      cm(c.ancho),
      c.espesor,
      MATERIALES[c.material].nombre,
      c.canto ? `${(c.canto / 1000).toFixed(2)} m` : '-',
    ]),
    headStyles: { fillColor: CAFE },
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
  })

  titulo(doc, 'Materiales y costo estimado', finalY(doc) + 12)
  autoTable(doc, {
    startY: finalY(doc) + 17,
    head: [['Material o herraje', 'Comprar', 'Precio', 'Total', 'Dónde']],
    body: costos.lineas.map((l) => [l.nombre, `${l.cantidad} ${l.unidadVenta}`, formatoCLP(l.precioUnitario), formatoCLP(l.total), l.tienda]),
    foot: [['Total estimado', '', '', formatoCLP(costos.total), '']],
    headStyles: { fillColor: CAFE },
    footStyles: { fillColor: [245, 236, 225], textColor: 30 },
    styles: { fontSize: 9 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
  })
  doc.setFontSize(8).setTextColor(120).text('Precios referenciales aproximados; confírmalos en la tienda.', MARGEN, finalY(doc) + 6)

  // Plano de cortes
  if (opt.tableros.length || opt.barras.length) {
    doc.addPage()
    titulo(doc, 'Plano de cortes', 20)
    y = 28
    const anchoDisp = anchoPag - 2 * MARGEN
    for (const [i, t] of opt.tableros.entries()) {
      const k = anchoDisp / t.largo
      const alto = t.ancho * k
      if (y + alto + 10 > altoPag - 12) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(9).setTextColor(60).text(`Plancha ${i + 1} · ${MATERIALES[t.material].nombre} · uso ${t.uso}%`, MARGEN, y)
      y += 3
      doc.setDrawColor(120).setFillColor(235, 230, 222).rect(MARGEN, y, t.largo * k, alto, 'FD')
      for (const p of t.piezas) {
        // El color de texto de jsPDF es el mismo relleno del PDF: se repone en cada pieza.
        doc.setFillColor(214, 178, 132)
        doc.rect(MARGEN + p.x * k, y + p.y * k, p.w * k, p.h * k, 'FD')
        const fs = Math.max(5, Math.min(12, p.h * k * 1.6, p.w * k * 1.6))
        doc.setFontSize(fs).setTextColor(40)
        doc.text(p.letra, MARGEN + (p.x + p.w / 2) * k, y + (p.y + p.h / 2) * k, { align: 'center', baseline: 'middle' })
        if (p.w * k > 22 && p.h * k > 10) {
          doc.setFontSize(6).text(`${cm(p.w)}×${cm(p.h)}`, MARGEN + (p.x + p.w / 2) * k, y + (p.y + p.h / 2) * k + fs * 0.35 + 1.5, {
            align: 'center',
            baseline: 'middle',
          })
        }
      }
      y += alto + 10
    }
    for (const [i, b] of opt.barras.entries()) {
      const k = anchoDisp / b.largo
      if (y + 16 > altoPag - 12) {
        doc.addPage()
        y = 20
      }
      doc.setFontSize(9).setTextColor(60).text(`${MATERIALES[b.material].nombre} · pieza ${i + 1} · sobra ${cm(b.sobrante)} cm`, MARGEN, y)
      y += 3
      doc.setDrawColor(120).setFillColor(235, 230, 222).rect(MARGEN, y, b.largo * k, 8, 'FD')
      for (const c of b.cortes) {
        doc.setFillColor(214, 178, 132)
        doc.rect(MARGEN + c.inicio * k, y, c.largo * k, 8, 'FD')
        doc.setFontSize(7).setTextColor(40).text(`${c.letra} ${cm(c.largo)}`, MARGEN + (c.inicio + c.largo / 2) * k, y + 4, { align: 'center', baseline: 'middle' })
      }
      y += 16
    }
  }

  // Guía paso a paso
  doc.addPage()
  titulo(doc, 'Guía paso a paso', 20)
  y = 28
  for (const [i, paso] of res.pasos.entries()) {
    const img = capturas.pasos[i]
    const texto = doc.splitTextToSize(paso.texto, anchoPag - 2 * MARGEN)
    const consejo = paso.consejo ? doc.splitTextToSize(`Consejo: ${paso.consejo}`, anchoPag - 2 * MARGEN) : []
    const piezas = [...new Set(res.piezas.filter((p) => p.paso === i).map((p) => letras[p.clave]))].sort()
    const altoNecesario = 10 + texto.length * 5 + consejo.length * 5 + (img ? 75 : 0)
    if (y + altoNecesario > altoPag - 12) {
      doc.addPage()
      y = 20
    }
    doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(...CAFE).text(`${i + 1}. ${paso.titulo}`, MARGEN, y)
    y += 6
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(40)
    if (piezas.length) {
      doc.text(`Piezas: ${piezas.join(', ')}`, MARGEN, y)
      y += 5
    }
    doc.text(texto, MARGEN, y)
    y += texto.length * 5
    if (consejo.length) {
      doc.setTextColor(110, 80, 30).text(consejo, MARGEN, y)
      doc.setTextColor(40)
      y += consejo.length * 5
    }
    if (img) y = imagen(doc, img, y + 2, 70) + 4
    y += 6
  }

  const paginas = doc.getNumberOfPages()
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p)
    doc.setFontSize(8).setTextColor(150).text(`${p} / ${paginas}`, anchoPag - MARGEN, altoPag - 8, { align: 'right' })
    doc.text(`Carpintería para tu hogar · Fabrican: ${tiendas.map((t) => t.nombre).join(' y ')}`, MARGEN, altoPag - 8)
  }
  return doc
}
