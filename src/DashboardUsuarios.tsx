import { useState, useEffect } from 'react'
import { getUsuarios, type UsuarioAdmin } from './api'

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
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre || '—'}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <span className={`dash-estado ${u.isActive ? 'activo' : 'inactivo'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}