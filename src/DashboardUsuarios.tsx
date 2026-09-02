import { useState, useEffect } from 'react'
import { getUsuarios, type UsuarioAdmin } from './api'
import { Users } from 'lucide-react'

const TINTS = ['#faf3e0', '#f2ede2', '#f8ece0']

export default function DashboardUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getUsuarios()
      .then(setUsuarios)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar usuarios'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <h2 className="dash-section-title">Usuarios</h2>
      {loading && <p className="cita-loading">Cargando usuarios...</p>}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && usuarios.length === 0 && (
        <p className="dash-empty">No hay usuarios registrados.</p>
      )}
      {!loading && !error && usuarios.length > 0 && (
        <div className="dash-list-cards">
          {usuarios.map((u, i) => (
            <div
              key={u.id}
              className="dash-list-card"
              style={{ '--tint': TINTS[i % TINTS.length] } as React.CSSProperties}
            >
              <span className="dash-list-card-icon">
                <Users size={22} strokeWidth={2} />
              </span>
              <div className="dash-list-card-body">
                <p className="dash-list-card-title">{u.nombre || '—'}</p>
                <p className="dash-list-card-meta">
                  <span>{u.email}</span>
                  <span>· {u.role}</span>
                  <span className={`dash-estado ${u.isActive ? 'activo' : 'inactivo'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
