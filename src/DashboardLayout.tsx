import { useState } from 'react'
import { useAuth } from './auth'
import DashboardHomeAdmin from './DashboardHomeAdmin'
import DashboardHomePaciente from './DashboardHomePaciente'
import DashboardCitasAdmin from './DashboardCitasAdmin'
import DashboardMisCitas from './DashboardMisCitas'
import DashboardTratamientos from './DashboardTratamientos'
import DashboardPacientes from './DashboardPacientes'
import DashboardServicios from './DashboardServicios'
import DashboardDermatologos from './DashboardDermatologos'
import DashboardUsuarios from './DashboardUsuarios'
import DashboardMiPerfil from './DashboardMiPerfil'
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
  const menuItems = isAdmin ? ADMIN_MENU : L1_MENU

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return isAdmin ? <DashboardHomeAdmin /> : <DashboardHomePaciente />
      case 'citas':
        return <DashboardCitasAdmin />
      case 'mis-citas':
        return <DashboardMisCitas />
      case 'tratamientos':
        return <DashboardTratamientos />
      case 'pacientes':
        return <DashboardPacientes />
      case 'servicios':
        return <DashboardServicios />
      case 'dermatologos':
        return <DashboardDermatologos />
      case 'usuarios':
        return <DashboardUsuarios />
      case 'mi-perfil':
        return <DashboardMiPerfil />
      default:
        return (
          <div className="dash-placeholder">
            <h2>{SECTION_LABELS[activeSection] || activeSection}</h2>
            <p>Sección en desarrollo</p>
          </div>
        )
    }
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

        <main className="dash-content">{renderSection()}</main>
      </div>
    </div>
  )
}
