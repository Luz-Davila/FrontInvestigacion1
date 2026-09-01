import { useState, useEffect } from 'react'
import { getCitas, type CitaResponse } from './api'

export default function DashboardMisCitas() {
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getCitas()
      .then(setCitas)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar citas'
        setError(msg)
        setCitas([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h2 className="dash-section-title">Mis Citas</h2>
      {loading && <p className="cita-loading">Cargando citas...</p>}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && citas.length === 0 && (
        <p className="dash-empty">No hay citas registradas.</p>
      )}
      {!loading && !error && citas.length > 0 && (
        <div className="dash-citas-list">
          {citas.map((cita) => (
            <div key={cita.id} className="dash-cita-card">
              <div className="dash-cita-header">
                <span className="dash-cita-estado">{cita.estado}</span>
                <span className="dash-cita-fecha">
                  {new Date(cita.fechaHora).toLocaleDateString('es-CR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                  {' '}
                  {new Date(cita.fechaHora).toLocaleTimeString('es-CR', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="dash-cita-body">
                <p><strong>Servicio:</strong> {cita.servicio.nombre}</p>
                <p><strong>Dermatólogo:</strong> {cita.dermatologo.nombre}</p>
                {cita.tratamientos.length > 0 && (
                  <p>
                    <strong>Tratamientos:</strong>{' '}
                    {cita.tratamientos.map((t) => t.nombre).join(', ')}
                  </p>
                )}
                {cita.notas && (
                  <p className="dash-cita-notas"><strong>Notas:</strong> {cita.notas}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}