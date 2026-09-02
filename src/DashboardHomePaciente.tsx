import { useState, useEffect } from 'react'
import { getCitas, type CitaResponse } from './api'
import { CalendarDays, Clock, Sparkles } from 'lucide-react'
import { useAuth } from './auth'

export default function DashboardHomePaciente() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getCitas()
      .then(setCitas)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar tus citas'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const [ahora] = useState(() => Date.now())
  const proximas = citas
    .filter((c) => new Date(c.fechaHora).getTime() >= ahora)
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())

  const proximaCita = proximas[0]
  const vencimiento = user?.subscriptionExpirationDate
    ? new Date(user.subscriptionExpirationDate).toLocaleDateString('es-CR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <div className="dash-home">
      <div className="dash-home-greeting">
        <h2>Hola{user?.nombre ? `, ${user.nombre}` : ''}</h2>
        <p>Este es tu resumen en DermaVita</p>
      </div>

      {error && <div className="dash-error">{error}</div>}
      {loading && <p className="cita-loading">Cargando tu información...</p>}

      {!loading && !error && (
        <>
          <div className="dash-cards-grid">
            <div className="dash-card">
              <span className="dash-card-icon"><CalendarDays size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">
                {proximaCita
                  ? new Date(proximaCita.fechaHora).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })
                  : '—'}
              </span>
              <span className="dash-card-label">Próxima cita</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-icon"><Clock size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{citas.length}</span>
              <span className="dash-card-label">Citas totales</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-icon"><Sparkles size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{vencimiento}</span>
              <span className="dash-card-label">Vencimiento de suscripción</span>
            </div>
          </div>

          <div className="dash-home-section">
            <h3>Tus próximas citas</h3>
            {proximas.length === 0 && <p className="dash-home-empty">No tienes citas próximas.</p>}
            {proximas.length > 0 && (
              <div className="dash-home-list">
                {proximas.slice(0, 5).map((c) => (
                  <div key={c.id} className="dash-home-list-item">
                    <span>
                      <strong>{c.servicio.nombre}</strong> con {c.dermatologo.nombre}
                    </span>
                    <span>
                      {new Date(c.fechaHora).toLocaleDateString('es-CR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                      {' '}
                      {new Date(c.fechaHora).toLocaleTimeString('es-CR', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
