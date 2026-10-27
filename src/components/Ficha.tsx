import { FECHA_PRECIOS, nombreHerramienta, productoDe } from '../core/catalogo'
import { DIFICULTAD, formatoCLP, type LineaCosto } from '../core/costos'
import type { ProyectoDef } from '../core/types'
import { NOTA_PROFESIONAL, conProfesional } from '../lib/profesional'
import { FUENTES, GAMAS_HERRAMIENTAS, PRECIOS_POR_TIENDA, comprar, etiquetaPermiso, fechaLarga } from '../lib/investigacion'

interface Props {
  proyecto: ProyectoDef
  lineas: LineaCosto[]
}

const GAMAS = [
  ['economica', 'Económica'],
  ['media', 'Media'],
  ['premium', 'Premium'],
] as const

function Enlace({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

/** Ficha técnica del proyecto: reglas con su fuente, permisos, herramientas y dónde comprar cada material. */
export function Ficha({ proyecto, lineas }: Props) {
  const permiso = etiquetaPermiso(proyecto.permiso)
  return (
    <div className="ficha">
      <section>
        <h3>Sobre este proyecto</h3>
        <p>{proyecto.descripcion}</p>
        <p className="ficha-datos">
          <span>Categoría: {proyecto.categoria[0].toUpperCase() + proyecto.categoria.slice(1)}</span>
          <span>Dificultad: {DIFICULTAD[proyecto.dificultad - 1]}</span>
          <span>Tiempo: {proyecto.horas}</span>
        </p>
      </section>

      {proyecto.permiso && (
        <section className={`ficha-permiso ${permiso?.tipo ?? ''}`}>
          <h3>Permisos {permiso && <span className={`chip-permiso ${permiso.tipo}`}>{permiso.texto}</span>}</h3>
          <p>{proyecto.permiso}</p>
          <p className="ficha-fuente">
            Fuente: <Enlace href={FUENTES.oguc.url}>{FUENTES.oguc.titulo}</Enlace>
          </p>
        </section>
      )}
      {conProfesional(proyecto) && <p className="ficha-nota">👷 {NOTA_PROFESIONAL}</p>}
      {proyecto.nota && <p className="ficha-nota">{proyecto.nota}</p>}

      {(proyecto.reglas?.length ?? 0) > 0 && (
        <section>
          <h3>Reglas que sigue el diseño</h3>
          <ul className="ficha-reglas">
            {proyecto.reglas!.map((r) => (
              <li key={r.texto}>
                {r.texto}
                {FUENTES[r.fuente] && (
                  <span className="ficha-fuente">
                    {' '}
                    — <Enlace href={FUENTES[r.fuente].url}>{FUENTES[r.fuente].titulo}</Enlace>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Herramientas recomendadas</h3>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Herramienta</th>
                {GAMAS.map(([, n]) => (
                  <th key={n}>{n}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proyecto.herramientas.map((h) => {
                const g = GAMAS_HERRAMIENTAS[h]?.gamas
                return (
                  <tr key={h}>
                    <td>{nombreHerramienta(h)}</td>
                    {GAMAS.map(([k]) => {
                      const o = g?.[k]
                      return (
                        <td key={k}>
                          {o ? (
                            <Enlace href={o.url}>
                              <strong>{formatoCLP(o.oferta ?? o.precio)}</strong>
                              <small>
                                {o.tienda}
                                {o.marca ? ` · ${o.marca}` : ''}
                              </small>
                            </Enlace>
                          ) : (
                            '—'
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>Dónde comprar los materiales</h3>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>Material o herraje</th>
                <th>Comprar</th>
                <th>Precio por tienda</th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l) => {
                const ofertas = PRECIOS_POR_TIENDA[l.id] ?? []
                const ref = productoDe(l.id)
                return (
                  <tr key={l.id}>
                    <td>{l.nombre}</td>
                    <td>{comprar(l.cantidad, l.unidadVenta)}</td>
                    <td>
                      <div className="ficha-tiendas">
                        {ofertas.length > 0
                          ? ofertas.map((o) => (
                              <Enlace key={o.tienda} href={o.url}>
                                <span className={o.tienda === l.tienda ? 'tienda-ref' : ''} title={o.producto}>
                                  {o.tienda} {formatoCLP(o.oferta ?? o.precio)}
                                </span>
                              </Enlace>
                            ))
                          : ref && (
                              <Enlace href={ref.url}>
                                <span className="tienda-ref" title={ref.producto}>
                                  {l.tienda} {formatoCLP(l.precioUnitario)}
                                </span>
                              </Enlace>
                            )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="nota">
          Precios consultados el {fechaLarga(FECHA_PRECIOS)} en las páginas de Sodimac, Easy e Imperial (con IVA). El presupuesto usa la opción marcada. Cada
          tienda puede vender otro envase o formato: pasa el cursor sobre el precio para ver el producto. Los precios cambian: confírmalos en la tienda.
        </p>
      </section>
    </div>
  )
}
