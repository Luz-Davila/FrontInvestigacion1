import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import Servicios from './Servicios'
import AgendarCita from './AgendarCita'
import Ubicacion from './Ubicacion'
import Login from './Login'
import Registro from './Registro'
import DashboardLayout from './DashboardLayout'
import { useAuth } from './auth'
import './App.css'

function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<'inicio' | 'servicios' | 'cita' | 'ubicacion' | 'login' | 'registro' | 'dashboard'>('inicio')

  const irAInicio = () => setPage('inicio')
  const irAServicios = () => setPage('servicios')
  const irACita = () => setPage('cita')
  const irAUbicacion = () => setPage('ubicacion')
  const irALogin = () => setPage('login')
  const irARegistro = () => setPage('registro')
  const irADashboard = () => setPage('dashboard')

  const handleInicio = () => {
    if (user) {
      irADashboard()
    } else {
      irALogin()
    }
  }

  useEffect(() => {
    if (page === 'login' && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPage('dashboard')
    } else if (page === 'dashboard' && !user) {
      setPage('login')
    }
  }, [user, page])

  if (loading) {
    return (
      <div className="login-page">
        <p className="cita-loading">Cargando...</p>
      </div>
    )
  }

  return (
    <>
      {page === 'inicio' && (
        <section className="hero">
          <img className="hero-bg" src={heroImg} alt="" />
          <div className="hero-overlay"></div>
          <nav className="navbar">
            <div className="navbar-logo">DermaVita</div>
            <ul className="navbar-links">
              <li><button className="navbar-btn" onClick={handleInicio}>Inicio</button></li>
              <li><button className="navbar-btn" onClick={irAServicios}>Servicios</button></li>
              <li><button className="navbar-btn" onClick={irACita}>Agendar cita</button></li>
              <li><button className="navbar-btn" onClick={irAUbicacion}>Ubicación</button></li>
            </ul>
          </nav>
          <div className="hero-content">
            <h1>Dermatología especializada</h1>
            <p>Tecnología y atención especializada para el cuidado de tu piel</p>
          </div>
        </section>
      )}

      {page === 'login' && <Login onVolver={irAInicio} onRegistrar={irARegistro} />}
      {page === 'registro' && <Registro onVolver={irALogin} onRegistrado={irADashboard} />}
      {page === 'dashboard' && user && <DashboardLayout onLogout={irAInicio} />}
      {page === 'servicios' && <Servicios onVolver={irAInicio} />}
      {page === 'cita' && <AgendarCita onVolver={irAInicio} />}
      {page === 'ubicacion' && <Ubicacion onVolver={irAInicio} />}
    </>
  )
}

export default App
