import { useState } from 'react'
import { register } from './api'
import { useAuth } from './auth'

interface RegistroProps {
  onVolver: () => void
  onRegistrado: () => void
}

export default function Registro({ onVolver, onRegistrado }: RegistroProps) {
  const { login } = useAuth()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [fechaNacimiento, setFechaNacimiento] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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

    setSubmitting(true)
    try {
      await register({
        nombre,
        email,
        password,
        telefono: telefono || undefined,
        fechaNacimiento: fechaNacimiento || undefined,
      })
      await login(email, password)
      onRegistrado()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form login-form--registro" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1 className="login-logo">DermaVita</h1>
          <p className="login-subtitle">Crea tu cuenta de paciente</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          Nombre completo *
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <label className="login-label">
          Email *
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </label>

        <label className="login-label">
          Teléfono
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="8888-8888"
          />
        </label>

        <label className="login-label">
          Fecha de nacimiento
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
          />
        </label>

        <label className="login-label">
          Contraseña *
          <input
            type="password"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <label className="login-label">
          Confirmar contraseña *
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="btn-confirmar" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Crear cuenta'}
        </button>

        <button type="button" className="btn-volver" onClick={onVolver}>
          ← Volver a iniciar sesión
        </button>
      </form>
    </div>
  )
}