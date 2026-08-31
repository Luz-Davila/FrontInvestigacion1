const servicios = [
  { nombre: "Consulta dermatológica general", duracionMinutos: 30, precio: 25000, activo: true },
  { nombre: "Consulta de seguimiento", duracionMinutos: 20, precio: 15000, activo: true },
  { nombre: "Tratamiento de acné", duracionMinutos: 45, precio: 35000, activo: true },
  { nombre: "Crioterapia", duracionMinutos: 20, precio: 18000, activo: true },
  { nombre: "Biopsia de piel", duracionMinutos: 30, precio: 40000, activo: true },
  { nombre: "Extracción de lunares", duracionMinutos: 40, precio: 45000, activo: true },
  { nombre: "Peeling químico", duracionMinutos: 45, precio: 50000, activo: true },
  { nombre: "Terapia con láser", duracionMinutos: 60, precio: 70000, activo: true },
  { nombre: "Revisión de lunares (mapeo corporal)", duracionMinutos: 30, precio: 30000, activo: true },
]

interface ServiciosProps {
  onVolver: () => void
}

export default function Servicios({ onVolver }: ServiciosProps) {
  const activos = servicios.filter((s) => s.activo)

  return (
    <div className="servicios-page">
      <div className="servicios-header">
        <h1>Servicios</h1>
        <p>Ofrecemos tratamientos dermatológicos especializados para el cuidado integral de tu piel.</p>
      </div>

      <div className="servicios-grid">
        {activos.map((s) => (
          <div key={s.nombre} className="servicio-card">
            <h3 className="servicio-nombre">{s.nombre}</h3>
            <div className="servicio-detalles">
              <span className="servicio-duracion">{s.duracionMinutos} min</span>
              <span className="servicio-separator">|</span>
              <span className="servicio-precio">₡{s.precio.toLocaleString('es-CR')}</span>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="btn-volver" onClick={onVolver}>
        ← Volver al inicio
      </button>
    </div>
  )
}
