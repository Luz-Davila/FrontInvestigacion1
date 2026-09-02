import { useState, useEffect } from 'react'
import {
  getDermatologos,
  crearDermatologo,
  actualizarDermatologo,
  updateIsActive,
  type Dermatologo,
} from './api'
import { UserRound } from 'lucide-react'

const TINTS = ['#faf3e0', '#f2ede2', '#f8ece0']

const emptyForm = {
  nombre: '',
  especialidad: '',
  numeroLicencia: '',
  email: '',
  password: '',
}

export default function DashboardDermatologos() {
  const [dermatologos, setDermatologos] = useState<Dermatologo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editando, setEditando] = useState<Dermatologo | null>(null)
  const [creando, setCreando] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    getDermatologos()
      .then(setDermatologos)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar dermatólogos'
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
    setForm(emptyForm)
    setError('')
  }

  const abrirEditar = (d: Dermatologo) => {
    setCreando(false)
    setEditando(d)
    setForm({
      nombre: d.nombre,
      especialidad: d.especialidad ?? '',
      numeroLicencia: d.numeroLicencia ?? '',
      email: '',
      password: '',
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
    if (!form.numeroLicencia.trim()) {
      setError('El número de licencia es requerido')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (editando) {
        await actualizarDermatologo(editando.id, {
          nombre: form.nombre,
          especialidad: form.especialidad || null,
          numeroLicencia: form.numeroLicencia,
        })
      } else {
        if (!form.email.trim() || !form.password.trim()) {
          setError('El email y la contraseña son requeridos')
          setBusy(false)
          return
        }
        await crearDermatologo({
          nombre: form.nombre,
          email: form.email,
          password: form.password,
          numeroLicencia: form.numeroLicencia,
        })
      }
      cancelar()
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el dermatólogo'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const alternarActivo = async (d: Dermatologo) => {
    if (!d.usuarioId) return
    const accion = d.isActive ? 'inhabilitar' : 'reactivar'
    if (!window.confirm(`¿${accion === 'inhabilitar' ? 'Inhabilitar' : 'Reactivar'} a "${d.nombre}"?`)) return
    setBusy(true)
    setError('')
    try {
      await updateIsActive(d.usuarioId, !d.isActive)
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Error al ${accion} el dermatólogo`
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const mostrandoFormulario = creando || editando !== null

  return (
    <>
      <div className="dash-toolbar">
        <h2 className="dash-section-title">Dermatólogos</h2>
        {!mostrandoFormulario && (
          <button type="button" className="dash-btn dash-btn-primary" onClick={abrirCrear}>
            + Nuevo dermatólogo
          </button>
        )}
      </div>

      {error && <div className="dash-error">{error}</div>}

      {mostrandoFormulario && (
        <form className="dash-form" onSubmit={guardar}>
          <h3 className="dash-form-title">
            {editando ? 'Editar dermatólogo' : 'Nuevo dermatólogo'}
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
            Especialidad
            <input
              type="text"
              value={form.especialidad}
              onChange={(e) => setForm((f) => ({ ...f, especialidad: e.target.value }))}
            />
          </label>
          <label className="dash-form-label">
            Número de licencia *
            <input
              type="text"
              value={form.numeroLicencia}
              onChange={(e) => setForm((f) => ({ ...f, numeroLicencia: e.target.value }))}
            />
          </label>
          {creando && (
            <>
              <label className="dash-form-label">
                Email *
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label className="dash-form-label">
                Contraseña *
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </label>
            </>
          )}
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

      {loading && <p className="cita-loading">Cargando dermatólogos...</p>}
      {!loading && !error && dermatologos.length === 0 && (
        <p className="dash-empty">No hay dermatólogos registrados.</p>
      )}
      {!loading && !error && dermatologos.length > 0 && (
        <div className="dash-list-cards">
          {dermatologos.map((d, i) => (
            <div
              key={d.id}
              className="dash-list-card"
              style={{ '--tint': TINTS[i % TINTS.length] } as React.CSSProperties}
            >
              <span className="dash-list-card-icon">
                <UserRound size={22} strokeWidth={2} />
              </span>
              <div className="dash-list-card-body">
                <p className="dash-list-card-title">{d.nombre}</p>
                <p className="dash-list-card-meta">
                  <span>{d.especialidad || 'Sin especialidad'}</span>
                  <span>· Licencia {d.numeroLicencia || '—'}</span>
                  <span className={`dash-estado ${d.isActive ? 'activo' : 'inactivo'}`}>
                    {d.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>
              <div className="dash-list-card-actions">
                <button
                  type="button"
                  className="dash-btn dash-btn-ghost"
                  onClick={() => abrirEditar(d)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="dash-btn dash-btn-danger"
                  disabled={busy || !d.usuarioId}
                  onClick={() => alternarActivo(d)}
                >
                  {d.isActive ? 'Inhabilitar' : 'Reactivar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
