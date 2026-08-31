import { useState, useEffect, useMemo } from 'react'
import {
  getServicios,
  getDermatologos,
  register,
  login,
  crearCita,
  type Servicio,
  type Dermatologo,
} from './api'

interface AgendarCitaProps {
  onVolver: () => void
}

function generateDates(): string[] {
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

function formatFechaDisplay(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-CR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const HORAS_DISPONIBLES = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']

export default function AgendarCita({ onVolver }: AgendarCitaProps) {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [dermatologos, setDermatologos] = useState<Dermatologo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [nuevoUsuario, setNuevoUsuario] = useState(true)

  const [servicioId, setServicioId] = useState('')
  const [dermatologoId, setDermatologoId] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [emailLogin, setEmailLogin] = useState('')
  const [passwordLogin, setPasswordLogin] = useState('')

  const fechasDisponibles = useMemo(() => generateDates(), [])

  useEffect(() => {
    Promise.all([getServicios(), getDermatologos()])
      .then(([s, d]) => {
        setServicios(s)
        setDermatologos(d)
      })
      .catch(() => setError('Error al cargar los datos del servidor'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (!servicioId || !fecha || !hora) {
      setError('Selecciona un servicio, fecha y hora')
      return
    }

    const fechaHora = new Date(`${fecha}T${hora}`)
    if (fechaHora < new Date()) {
      setError('No se pueden agendar citas en el pasado')
      return
    }

    if (nuevoUsuario) {
      if (!nombre || !email || !password || !confirmarPassword) {
        setError('Completa todos los campos requeridos')
        return
      }
      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        return
      }
      if (password !== confirmarPassword) {
        setError('Las contraseñas no coinciden')
        return
      }
    } else {
      if (!emailLogin || !passwordLogin) {
        setError('Completa email y contraseña')
        return
      }
    }

    setSubmitting(true)

    try {
      if (nuevoUsuario) {
        try {
          await register({
            nombre,
            email,
            password,
            telefono: telefono || undefined,
            fechaNacimiento: fechaNacimiento || undefined,
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Error al registrar'
          if (msg.includes('ya existe') || msg.includes('Usuario ya existe')) {
            setError('Este email ya está registrado. Inicia sesión en su lugar.')
            setSubmitting(false)
            return
          }
          throw err
        }

        const loginRes = await login(email, password)
        localStorage.setItem('authToken', loginRes.token)
        localStorage.setItem('refreshToken', loginRes.refreshToken)
      } else {
        const loginRes = await login(emailLogin, passwordLogin)
        localStorage.setItem('authToken', loginRes.token)
        localStorage.setItem('refreshToken', loginRes.refreshToken)
      }

      const citaRes = await crearCita({
        servicioId,
        dermatologoId: dermatologoId || '00000000-0000-0000-0000-000000000000',
        fechaHora: fechaHora.toISOString(),
        notas: notas || undefined,
      })

      setExito(citaRes.mensaje || 'Tu cita fue solicitada y quedó pendiente de confirmación')
      setServicioId('')
      setDermatologoId('')
      setFecha('')
      setHora('')
      setNotas('')
      setNombre('')
      setEmail('')
      setTelefono('')
      setFechaNacimiento('')
      setPassword('')
      setConfirmarPassword('')
      setEmailLogin('')
      setPasswordLogin('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="cita-page">
        <p className="cita-loading">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="cita-page">
      <div className="cita-header">
        <h1>Agendar Cita</h1>
        <p>Selecciona el servicio, fecha y horario que prefieras.</p>
      </div>

      {error && <div className="cita-error">{error}</div>}

      {exito ? (
        <div className="cita-exito-container">
          <div className="cita-exito-icon">✓</div>
          <div className="cita-exito">{exito}</div>
          <button type="button" className="btn-confirmar" onClick={onVolver}>
            Volver al inicio
          </button>
        </div>
      ) : (
        <>
          <form className="cita-form" onSubmit={handleSubmit}>
        <fieldset className="cita-fieldset">
          <div className="cita-legend-row">
            <legend>Datos de la cita</legend>
          </div>

          <label className="cita-label">
            Servicio *
            <select value={servicioId} onChange={(e) => setServicioId(e.target.value)}>
              <option value="">Selecciona un servicio</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="cita-label">
            Dermatólogo
            <select value={dermatologoId} onChange={(e) => setDermatologoId(e.target.value)}>
              <option value="">Cualquiera disponible</option>
              {dermatologos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}{d.especialidad ? ` — ${d.especialidad}` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="cita-row-center">
            <label className="cita-label">
              Fecha *
              <select value={fecha} onChange={(e) => setFecha(e.target.value)}>
                <option value="">Selecciona una fecha</option>
                {fechasDisponibles.map((f) => (
                  <option key={f} value={f}>
                    {formatFechaDisplay(f)}
                  </option>
                ))}
              </select>
            </label>
            <label className="cita-label">
              Hora *
              <select value={hora} onChange={(e) => setHora(e.target.value)}>
                <option value="">Selecciona una hora</option>
                {HORAS_DISPONIBLES.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="cita-label">
            Notas / Motivo de consulta
            <textarea
              value={notas}
              rows={3}
              placeholder="Describe brevemente el motivo de tu consulta..."
              onChange={(e) => setNotas(e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="cita-fieldset">
          <div className="cita-legend-row">
            <legend>Datos del paciente</legend>
            <label className="cita-toggle">
              <input
                type="checkbox"
                checked={!nuevoUsuario}
                onChange={(e) => setNuevoUsuario(!e.target.checked)}
              />
              <span>¿Ya tienes cuenta?</span>
            </label>
          </div>

          {nuevoUsuario ? (
            <>
              <label className="cita-label">
                Nombre completo *
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </label>
              <label className="cita-label">
                Email *
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <div className="cita-row-center">
                <label className="cita-label">
                  Teléfono *
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </label>
                <label className="cita-label">
                  Fecha de nacimiento *
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                  />
                </label>
              </div>
              <label className="cita-label">
                Contraseña *
                <input
                  type="password"
                  value={password}
                  minLength={8}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label className="cita-label">
                Confirmar contraseña *
                <input
                  type="password"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                />
              </label>
            </>
          ) : (
            <>
              <label className="cita-label">
                Email *
                <input
                  type="email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                />
              </label>
              <label className="cita-label">
                Contraseña *
                <input
                  type="password"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                />
              </label>
            </>
          )}

          <div className="cita-acciones-center">
            <button
              type="submit"
              className="btn-confirmar"
              disabled={submitting}
            >
              {submitting ? 'Procesando...' : 'Confirmar Cita'}
            </button>
          </div>
        </fieldset>
      </form>

      <div className="cita-acciones">
        <button type="button" className="btn-volver" onClick={onVolver}>
          ← Volver al inicio
        </button>
      </div>
        </>
      )}
    </div>
  )
}
