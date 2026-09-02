import { useState, useEffect } from 'react'
import { getUsuarios, updateSubscriptionExpiration, type UsuarioAdmin } from './api'
import { Users } from 'lucide-react'

const TINTS = ['#faf3e0', '#f2ede2', '#f8ece0']

export default function DashboardUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [fecha, setFecha] = useState('')
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    getUsuarios()
      .then(setUsuarios)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar usuarios'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const abrirEditar = (u: UsuarioAdmin) => {
    setEditandoId(u.id)
    setFecha(u.subscriptionExpirationDate ? u.subscriptionExpirationDate.slice(0, 10) : '')
    setError('')
  }

  const cancelar = () => {
    setEditandoId(null)
    setFecha('')
    setError('')
  }

  const guardar = async (u: UsuarioAdmin) => {
    if (!fecha) {
      setError('Selecciona una fecha de vencimiento')
      return
    }
    setBusy(true)
    setError('')
    try {
      await updateSubscriptionExpiration(u.id, fecha)
      cancelar()
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el vencimiento'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const formatFecha = (fechaIso: string | null) =>
    fechaIso
      ? new Date(fechaIso).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'Sin fecha'

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
                  <span>· Vence: {formatFecha(u.subscriptionExpirationDate)}</span>
                  <span className={`dash-estado ${u.isActive ? 'activo' : 'inactivo'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
                {editandoId === u.id && (
                  <div className="dash-list-card-edit">
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                    />
                    <button
                      type="button"
                      className="dash-btn dash-btn-primary"
                      disabled={busy}
                      onClick={() => guardar(u)}
                    >
                      {busy ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" className="dash-btn dash-btn-ghost" onClick={cancelar}>
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              {editandoId !== u.id && (
                <div className="dash-list-card-actions">
                  <button
                    type="button"
                    className="dash-btn dash-btn-ghost"
                    onClick={() => abrirEditar(u)}
                  >
                    Editar vencimiento
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
