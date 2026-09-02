import { useState, useEffect } from 'react'
import {
  getPacientes,
  actualizarPaciente,
  eliminarPaciente,
  type Paciente,
} from './api'
import { User } from 'lucide-react'

const TINTS = ['#faf3e0', '#f2ede2', '#f8ece0']

export default function DashboardPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<Paciente | null>(null)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    getPacientes()
      .then(setPacientes)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar pacientes'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const abrirEditar = (p: Paciente) => {
    setEditando(p)
    setNombre(p.nombre)
    setTelefono(p.telefono ?? '')
    setFechaNacimiento(p.fechaNacimiento ?? '')
    setError('')
  }

  const cancelar = () => {
    setEditando(null)
    setNombre('')
    setTelefono('')
    setFechaNacimiento('')
    setError('')
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    setBusy(true)
    setError('')
    try {
      await actualizarPaciente(editando.id, {
        nombre,
        telefono: telefono || null,
        fechaNacimiento: fechaNacimiento || null,
      })
      cancelar()
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar el paciente'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const eliminar = async (p: Paciente) => {
    if (!window.confirm(`¿Eliminar al paciente "${p.nombre}"?`)) return
    setBusy(true)
    setError('')
    try {
      await eliminarPaciente(p.id)
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el paciente'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="dash-toolbar">
        <h2 className="dash-section-title">Pacientes</h2>
        <span className="dash-toolbar-note">
          Las cuentas se crean desde el registro público
        </span>
      </div>

      {error && <div className="dash-error">{error}</div>}

      {editando && (
        <form className="dash-form" onSubmit={guardar}>
          <h3 className="dash-form-title">Editar paciente</h3>
          <label className="dash-form-label">
            Nombre *
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label className="dash-form-label">
            Teléfono
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </label>
          <label className="dash-form-label">
            Fecha de nacimiento
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
          </label>
          <div className="dash-form-actions">
            <button type="submit" className="dash-btn dash-btn-primary" disabled={busy}>
              {busy ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" className="dash-btn dash-btn-ghost" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading && <p className="cita-loading">Cargando pacientes...</p>}
      {!loading && !error && pacientes.length === 0 && (
        <p className="dash-empty">No hay pacientes registrados.</p>
      )}
      {!loading && !error && pacientes.length > 0 && (
        <div className="dash-list-cards">
          {pacientes.map((p, i) => (
            <div
              key={p.id}
              className="dash-list-card"
              style={{ '--tint': TINTS[i % TINTS.length] } as React.CSSProperties}
            >
              <span className="dash-list-card-icon">
                <User size={22} strokeWidth={2} />
              </span>
              <div className="dash-list-card-body">
                <p className="dash-list-card-title">{p.nombre}</p>
                <p className="dash-list-card-meta">
                  <span>{p.email}</span>
                  <span>· {p.telefono || 'Sin teléfono'}</span>
                  <span>
                    ·{' '}
                    {p.fechaNacimiento
                      ? new Date(p.fechaNacimiento).toLocaleDateString('es-CR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })
                      : 'Sin fecha de nacimiento'}
                  </span>
                </p>
              </div>
              <div className="dash-list-card-actions">
                <button
                  type="button"
                  className="dash-btn dash-btn-ghost"
                  onClick={() => abrirEditar(p)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-danger"
                  disabled={busy}
                  onClick={() => eliminar(p)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}