import { useState, useEffect } from 'react'
import {
  getServicios,
  crearServicio,
  actualizarServicio,
  type Servicio,
} from './api'

const emptyForm = { nombre: '', duracionMinutos: '', precio: '' }

export default function DashboardServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<Servicio | null>(null)
  const [creando, setCreando] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    getServicios()
      .then(setServicios)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar servicios'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const formatPrecio = (precio: number) =>
    new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC' }).format(precio)

  const abrirCrear = () => {
    setEditando(null)
    setCreando(true)
    setForm(emptyForm)
    setError('')
  }

  const abrirEditar = (s: Servicio) => {
    setCreando(false)
    setEditando(s)
    setForm({
      nombre: s.nombre,
      duracionMinutos: String(s.duracionMinutos),
      precio: String(s.precio),
    })
    setError('')
  }

  const cancelar = () => {
    setCreando(false)
    setEditando(null)
    setForm(emptyForm)
    setError('')
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    const duracion = Number(form.duracionMinutos)
    const precio = Number(form.precio)
    if (!duracion || duracion <= 0) {
      setError('La duración debe ser un número mayor a 0')
      return
    }
    if (!precio || precio <= 0) {
      setError('El precio debe ser un número mayor a 0')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (editando) {
        await actualizarServicio(editando.id, {
          nombre: form.nombre,
          duracionMinutos: duracion,
          precio,
          activo: editando.activo,
        })
      } else {
        await crearServicio({ nombre: form.nombre, duracionMinutos: duracion, precio })
      }
      cancelar()
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el servicio'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const alternarActivo = async (s: Servicio) => {
    const accion = s.activo ? 'inhabilitar' : 'reactivar'
    if (!window.confirm(`¿${accion === 'inhabilitar' ? 'Inhabilitar' : 'Reactivar'} el servicio "${s.nombre}"?`)) return
    setBusy(true)
    setError('')
    try {
      await actualizarServicio(s.id, {
        nombre: s.nombre,
        duracionMinutos: s.duracionMinutos,
        precio: s.precio,
        activo: !s.activo,
      })
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error al ${accion} el servicio`
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const mostrandoFormulario = creando || editando !== null

  return (
    <>
      <div className="dash-toolbar">
        <h2 className="dash-section-title">Servicios</h2>
        {!mostrandoFormulario && (
          <button type="button" className="dash-btn dash-btn-primary" onClick={abrirCrear}>
            + Nuevo servicio
          </button>
        )}
      </div>

      {error && <div className="dash-error">{error}</div>}

      {mostrandoFormulario && (
        <form className="dash-form" onSubmit={guardar}>
          <h3 className="dash-form-title">
            {editando ? 'Editar servicio' : 'Nuevo servicio'}
          </h3>
          <label className="dash-form-label">
            Nombre *
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </label>
          <label className="dash-form-label">
            Duración (minutos) *
            <input
              type="number"
              min={1}
              value={form.duracionMinutos}
              onChange={(e) => setForm((f) => ({ ...f, duracionMinutos: e.target.value }))}
            />
          </label>
          <label className="dash-form-label">
            Precio (₡) *
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
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

      {loading && <p className="cita-loading">Cargando servicios...</p>}
      {!loading && !error && servicios.length === 0 && (
        <p className="dash-empty">No hay servicios registrados.</p>
      )}
      {!loading && !error && servicios.length > 0 && (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Estado</th>
              <th className="dash-table-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.duracionMinutos} min</td>
                <td>{formatPrecio(s.precio)}</td>
                <td>
                  <span className={`dash-estado ${s.activo ? 'activo' : 'inactivo'}`}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="dash-table-acciones">
                  <div className="dash-acciones">
                    <button
                      type="button"
                      className="dash-btn dash-btn-ghost"
                      onClick={() => abrirEditar(s)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="dash-btn dash-btn-danger"
                      disabled={busy}
                      onClick={() => alternarActivo(s)}
                    >
                      {s.activo ? 'Inhabilitar' : 'Reactivar'}
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
