import { useState } from 'react'
import heroImg from './assets/hero.png'
import Servicios from './Servicios'
import AgendarCita from './AgendarCita'
import Ubicacion from './Ubicacion'
import './App.css'

function App() {
  const [page, setPage] = useState<'inicio' | 'servicios' | 'cita' | 'ubicacion'>('inicio')

  const irAInicio = () => setPage('inicio')
  const irAServicios = () => setPage('servicios')
  const irACita = () => setPage('cita')
  const irAUbicacion = () => setPage('ubicacion')

  return (
    <>
      {page === 'inicio' && (
        <section className="hero">
          <img className="hero-bg" src={heroImg} alt="" />
          <div className="hero-overlay"></div>
          <nav className="navbar">
            <div className="navbar-logo">DermoVita</div>
            <ul className="navbar-links">
              <li><button className="navbar-btn" onClick={irAInicio}>Inicio</button></li>
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

      {page === 'servicios' && <Servicios onVolver={irAInicio} />}
      {page === 'cita' && <AgendarCita onVolver={irAInicio} />}
      {page === 'ubicacion' && <Ubicacion onVolver={irAInicio} />}
    </>
  )
}

export default App
