import { useState, useEffect } from 'react'
import { getDermatologos, type Dermatologo } from './api'

export default function DashboardDermatologos() {
  const [dermatologos, setDermatologos] = useState<Dermatologo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getDermatologos()
      .then(setDermatologos)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar dermatólogos'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h2 className="dash-section-title">Dermatólogos</h2>
      {loading && <p className="cita-loading">Cargando dermatólogos...</p>}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && dermatologos.length === 0 && (
        <p className="dash-empty">No hay dermatólogos registrados.</p>
      )}
      {!loading && !error && dermatologos.length > 0 && (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
            </tr>
          </thead>
          <tbody>
            {dermatologos.map((d) => (
              <tr key={d.id}>
                <td>{d.nombre}</td>
                <td>{d.especialidad || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}