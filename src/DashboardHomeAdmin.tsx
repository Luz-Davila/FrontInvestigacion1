import { useState, useEffect } from 'react'
import { getCitas, getServicios, getDermatologos, getPacientes, type CitaResponse, type Dermatologo } from './api'
import { CalendarDays, Sparkles, UserRound, User, ChevronRight } from 'lucide-react'
import { useAuth } from './auth'

const TINTS = ['#faf3e0', '#f2ede2', '#f8ece0']

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function buildCalendario(citas: CitaResponse[]) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1)
  const startWeekday = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const citaDays = new Set(
    citas
      .filter((c) => {
        const d = new Date(c.fechaHora)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map((c) => new Date(c.fechaHora).getDate()),
  )
  const hoy = now.getDate()
  const cells: { day: number | null; isToday: boolean; hasCita: boolean }[] = []
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null, isToday: false, hasCita: false })
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isToday: d === hoy, hasCita: citaDays.has(d) })
  }
  const monthLabel = now.toLocaleDateString('es-CR', { month: 'long', year: 'numeric' })
  return { cells, monthLabel }
}

export default function DashboardHomeAdmin() {
  const { user } = useAuth()
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [serviciosActivos, setServiciosActivos] = useState(0)
  const [dermatologos, setDermatologos] = useState<Dermatologo[]>([])
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
        setDermatologos(d)
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

  const dermatologosActivos = dermatologos.filter((d) => d.isActive !== false).length
  const { cells, monthLabel } = buildCalendario(citas)

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

          <div className="dash-home-columns">
            <div className="dash-panel-card">
              <h3 className="dash-panel-title">Próximas citas</h3>
              {proximas.length === 0 && <p className="dash-home-empty">No hay citas próximas.</p>}
              {proximas.length > 0 && (
                <div className="dash-agenda-list">
                  {proximas.map((c, i) => (
                    <div
                      key={c.id}
                      className="dash-agenda-card"
                      style={{ '--tint': TINTS[i % TINTS.length] } as React.CSSProperties}
                    >
                      <span className="dash-agenda-icon">
                        <CalendarDays size={22} strokeWidth={2} />
                      </span>
                      <div className="dash-agenda-body">
                        <p className="dash-agenda-title">{c.servicio.nombre}</p>
                        <p className="dash-agenda-meta">
                          <strong>{c.paciente.nombre}</strong> · {c.dermatologo.nombre} ·{' '}
                          {new Date(c.fechaHora).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' })}
                          {' '}
                          {new Date(c.fechaHora).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="dash-agenda-arrow">
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dash-side-panel">
              <div className="dash-panel-card">
                <h3 className="dash-panel-title">{monthLabel[0].toUpperCase() + monthLabel.slice(1)}</h3>
                <div className="dash-mini-cal-grid">
                  {DOW.map((d, i) => (
                    <span key={i} className="dash-mini-cal-dow">{d}</span>
                  ))}
                  {cells.map((cell, i) => (
                    <span
                      key={i}
                      className={`dash-mini-cal-day ${cell.day === null ? 'is-empty' : ''} ${cell.isToday ? 'is-today' : ''} ${cell.hasCita ? 'has-cita' : ''}`}
                    >
                      {cell.day ?? ''}
                    </span>
                  ))}
                </div>
              </div>

              <div className="dash-panel-card">
                <h3 className="dash-panel-title">
                  Dermatólogos
                  <span className="dash-panel-link">Ver todos</span>
                </h3>
                {dermatologos.length === 0 && <p className="dash-home-empty">Sin registros.</p>}
                {dermatologos.length > 0 && (
                  <div className="dash-people-list">
                    {dermatologos.slice(0, 5).map((d) => (
                      <div key={d.id} className="dash-person-row">
                        <span className="dash-person-avatar">
                          {d.nombre.trim().charAt(0).toUpperCase()}
                          <span className={`dash-dot ${d.isActive === false ? 'inactivo' : 'activo'}`} />
                        </span>
                        <span>
                          <div className="dash-person-name">{d.nombre}</div>
                          <div className="dash-person-sub">{d.especialidad || 'Dermatología general'}</div>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
