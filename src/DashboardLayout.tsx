import { useState, useEffect } from 'react'
import { useAuth } from './auth'
import { getCitas, type CitaResponse } from './api'
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Activity,
  User,
  UserRound,
  Users,
  UserCircle2,
  type LucideIcon,
} from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  icon: LucideIcon
}

const ADMIN_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'citas', label: 'Agenda / Citas', icon: CalendarDays },
  { id: 'servicios', label: 'Servicios', icon: Sparkles },
  { id: 'tratamientos', label: 'Tratamientos', icon: Activity },
  { id: 'pacientes', label: 'Pacientes', icon: User },
  { id: 'dermatologos', label: 'Dermatólogos', icon: UserRound },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
]

const L1_MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Mi Dashboard', icon: LayoutDashboard },
  { id: 'mis-citas', label: 'Mis Citas', icon: CalendarDays },
  { id: 'mi-perfil', label: 'Mi Perfil', icon: UserCircle2 },
]

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  citas: 'Agenda / Citas',
  servicios: 'Servicios',
  tratamientos: 'Tratamientos',
  pacientes: 'Pacientes',
  dermatologos: 'Dermatólogos',
  usuarios: 'Usuarios',
  'mis-citas': 'Mis Citas',
  'mi-perfil': 'Mi Perfil',
}

interface DashboardLayoutProps {
  onLogout: () => void
}

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const { user, isAdmin, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [citasLoading, setCitasLoading] = useState(false)
  const [citasError, setCitasError] = useState('')
  const menuItems = isAdmin ? ADMIN_MENU : L1_MENU

  const needsCitas = activeSection === 'citas' || activeSection === 'mis-citas'

  useEffect(() => {
    if (!needsCitas) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCitasLoading(true)
    setCitasError('')
    getCitas()
      .then(setCitas)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar citas'
        setCitasError(msg)
        setCitas([])
      })
      .finally(() => setCitasLoading(false))
  }, [needsCitas])

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">DermaVita</div>
        <nav className="dash-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="dash-nav-icon">
                <item.icon size={20} strokeWidth={2} />
              </span>
              <span className="dash-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div className="dash-header-info">
            <span className="dash-header-name">{user?.nombre || user?.email}</span>
            <span className="dash-header-role">{user?.role === 'Admin' ? 'Administrador' : 'Suscriptor'}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        <main className="dash-content">
          {needsCitas ? (
            <>
              <h2 className="dash-section-title">{SECTION_LABELS[activeSection]}</h2>
              {citasLoading && <p className="cita-loading">Cargando citas...</p>}
              {citasError && <div className="dash-error">{citasError}</div>}
              {!citasLoading && !citasError && citas.length === 0 && (
                <p className="dash-empty">No hay citas registradas.</p>
              )}
              {!citasLoading && !citasError && citas.length > 0 && (
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
                        <p><strong>Paciente:</strong> {cita.paciente.nombre}</p>
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
          ) : (
            <div className="dash-placeholder">
              <h2>{SECTION_LABELS[activeSection] || activeSection}</h2>
              <p>Sección en desarrollo</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
