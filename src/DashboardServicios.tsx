import { useState, useEffect } from 'react'
import { getServicios, type Servicio } from './api'

export default function DashboardServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getServicios()
      .then(setServicios)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar servicios'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(precio)

  return (
    <>
      <h2 className="dash-section-title">Servicios</h2>
      {loading && <p className="cita-loading">Cargando servicios...</p>}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && servicios.length === 0 && (
        <p className="dash-empty">No hay servicios activos.</p>
      )}
      {!loading && !error && servicios.length > 0 && (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Duración</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.duracionMinutos} min</td>
                <td>{formatPrecio(s.precio)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}