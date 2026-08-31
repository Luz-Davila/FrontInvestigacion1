import { useState } from 'react'
import { useAuth } from './auth'

interface LoginProps {
  onVolver: () => void
  onRegistrar: () => void
}

export default function Login({ onVolver, onRegistrar }: LoginProps) {
  const { login, sessionExpired } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Completa email y contraseña')
      return
    }
    setSubmitting(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <h1 className="login-logo">DermaVita</h1>
          <p className="login-subtitle">Inicia sesión para acceder al panel</p>
        </div>

        {sessionExpired && (
          <div className="login-error">
            Tu sesión expiró. Inicia sesión de nuevo.
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <label className="login-label">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />
        </label>

        <label className="login-label">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="btn-confirmar" disabled={submitting}>
          {submitting ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="login-register">
          ¿No tienes cuenta?{' '}
          <button type="button" className="login-register-btn" onClick={onRegistrar}>
            Regístrate aquí
          </button>
        </p>

        <button type="button" className="btn-volver" onClick={onVolver}>
          ← Volver al inicio
        </button>
      </form>
    </div>
  )
}
