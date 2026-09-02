import { useState, useEffect } from 'react'
import { getCitas, getServicios, getDermatologos, getPacientes, type CitaResponse } from './api'
import { CalendarDays, Sparkles, UserRound, User } from 'lucide-react'
import { useAuth } from './auth'

export default function DashboardHomeAdmin() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [serviciosActivos, setServiciosActivos] = useState(0)
  const [dermatologosActivos, setDermatologosActivos] = useState(0)
  const [pacientes, setPacientes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    Promise.all([getCitas(), getServicios(), getDermatologos(), getPacientes()])
      .then(([c, s, d, p]) => {
        setCitas(c)
        setServiciosActivos(s.filter((x) => x.activo).length)
        setDermatologosActivos(d.filter((x) => x.isActive !== false).length)
        setPacientes(p.length)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar el resumen'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const [ahora] = useState(() => Date.now())
  const proximas = citas
    .filter((c) => new Date(c.fechaHora).getTime() >= ahora)
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, 5)

  return (
    <div className="dash-home">
      <div className="dash-home-greeting">
        <h2>Bienvenida{user?.nombre ? `, ${user.nombre}` : ''}</h2>
        <p>Resumen general de la clínica</p>
      </div>

      {error && <div className="dash-error">{error}</div>}
      {loading && <p className="cita-loading">Cargando resumen...</p>}

      {!loading && !error && (
        <>
          <div className="dash-cards-grid">
            <div className="dash-card">
              <span className="dash-card-icon"><CalendarDays size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{citas.length}</span>
              <span className="dash-card-label">Citas registradas</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-icon"><Sparkles size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{serviciosActivos}</span>
              <span className="dash-card-label">Servicios activos</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-icon"><UserRound size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{dermatologosActivos}</span>
              <span className="dash-card-label">Dermatólogos activos</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-icon"><User size={22} strokeWidth={2} /></span>
              <span className="dash-card-value">{pacientes}</span>
              <span className="dash-card-label">Pacientes registrados</span>
            </div>
          </div>

          <div className="dash-home-section">
            <h3>Próximas citas</h3>
            {proximas.length === 0 && <p className="dash-home-empty">No hay citas próximas.</p>}
            {proximas.length > 0 && (
              <div className="dash-home-list">
                {proximas.map((c) => (
                  <div key={c.id} className="dash-home-list-item">
                    <span>
                      <strong>{c.paciente.nombre}</strong> · {c.servicio.nombre} con {c.dermatologo.nombre}
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
