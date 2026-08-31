interface UbicacionProps {
  onVolver: () => void
}

export default function Ubicacion({ onVolver }: UbicacionProps) {
  return (
    <div className="ubicacion-page">
      <div className="ubicacion-header">
        <h1>Ubicación</h1>
        <p>Encuéntranos en el centro de Santa Cruz</p>
      </div>

      <div className="ubicacion-content">
        <div className="ubicacion-card">
          <h2 className="ubicacion-card-title">Información de contacto</h2>

          <div className="ubicacion-item">
            <div className="ubicacion-icon-box">📞</div>
            <div className="ubicacion-text">
              <span className="ubicacion-label">Teléfono</span>
              <span className="ubicacion-value">2045 9623</span>
            </div>
          </div>

          <div className="ubicacion-divider" />

          <div className="ubicacion-item">
            <div className="ubicacion-icon-box">📍</div>
            <div className="ubicacion-text">
              <span className="ubicacion-label">Dirección</span>
              <span className="ubicacion-value">Santa Cruz, Centro, frente al parte principal</span>
            </div>
          </div>

          <div className="ubicacion-divider" />

          <div className="ubicacion-item">
            <div className="ubicacion-icon-box">✉️</div>
            <div className="ubicacion-text">
              <span className="ubicacion-label">Correo electrónico</span>
              <span className="ubicacion-value">dermovita@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="ubicacion-map">
          <iframe
            title="Ubicación DermaVita"
            src="https://maps.google.com/maps?q=Santa+Cruz,+Guanacaste,+Costa+Rica&t=&z=15&ie=UTF8&iwloc=&output=embed"
            loading="lazy"
            allowFullScreen
          />
        </div>
      </div>

      <button type="button" className="btn-volver" onClick={onVolver}>
        ← Volver al inicio
      </button>
    </div>
  )
}
