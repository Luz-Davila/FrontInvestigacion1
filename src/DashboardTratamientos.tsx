import { useState, useEffect } from 'react'
import {
  getTratamientos,
  crearTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
  type Tratamiento,
} from './api'

export default function DashboardTratamientos() {
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<Tratamiento | null>(null)
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    getTratamientos()
      .then(setTratamientos)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar tratamientos'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const abrirCrear = () => {
    setEditando(null)
    setCreando(true)
    setNombre('')
    setDescripcion('')
    setError('')
  }

  const abrirEditar = (t: Tratamiento) => {
    setCreando(false)
    setEditando(t)
    setNombre(t.nombre)
    setDescripcion(t.descripcion ?? '')
    setError('')
  }

  const cancelar = () => {
    setCreando(false)
    setEditando(null)
    setNombre('')
    setDescripcion('')
    setError('')
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (editando) {
        await actualizarTratamiento(editando.id, { nombre, descripcion: descripcion || null })
      } else {
        await crearTratamiento({ nombre, descripcion: descripcion || null })
      }
      cancelar()
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el tratamiento'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const eliminar = async (t: Tratamiento) => {
    if (!window.confirm(`¿Eliminar el tratamiento "${t.nombre}"?`)) return
    setBusy(true)
    setError('')
    try {
      await eliminarTratamiento(t.id)
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el tratamiento'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const mostrandoFormulario = creando || editando !== null

  return (
    <>
      <div className="dash-toolbar">
        <h2 className="dash-section-title">Tratamientos</h2>
        {!mostrandoFormulario && (
          <button type="button" className="dash-btn dash-btn-primary" onClick={abrirCrear}>
            + Nuevo tratamiento
          </button>
        )}
      </div>

      {error && <div className="dash-error">{error}</div>}

      {mostrandoFormulario && (
        <form className="dash-form" onSubmit={guardar}>
          <h3 className="dash-form-title">
            {editando ? 'Editar tratamiento' : 'Nuevo tratamiento'}
          </h3>
          <label className="dash-form-label">
            Nombre *
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </label>
          <label className="dash-form-label">
            Descripción
            <textarea
              value={descripcion}
              rows={3}
              onChange={(e) => setDescripcion(e.target.value)}
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

      {loading && <p className="cita-loading">Cargando tratamientos...</p>}
      {!loading && !error && tratamientos.length === 0 && (
        <p className="dash-empty">No hay tratamientos registrados.</p>
      )}
      {!loading && !error && tratamientos.length > 0 && (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th className="dash-table-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tratamientos.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{t.descripcion || '—'}</td>
                <td className="dash-table-acciones">
                  <div className="dash-acciones">
                    <button
                      type="button"
                      className="dash-btn dash-btn-ghost"
                      onClick={() => abrirEditar(t)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn-danger"
                      disabled={busy}
                      onClick={() => eliminar(t)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}