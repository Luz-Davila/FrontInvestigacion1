import { useAuth } from './auth'

export default function DashboardMiPerfil() {
  const { user } = useAuth()

  if (!user) return null

  const fecha = user.subscriptionExpirationDate
    ? new Date(user.subscriptionExpirationDate).toLocaleDateString('es-CR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : '—'

  return (
    <>
      <h2 className="dash-section-title">Mi Perfil</h2>
      <div className="dash-perfil-card">
        <div className="dash-perfil-item">
          <span className="dash-perfil-label">Nombre</span>
          <span className="dash-perfil-value">{user.nombre || '—'}</span>
        </div>
        <div className="dash-perfil-item">
          <span className="dash-perfil-label">Email</span>
          <span className="dash-perfil-value">{user.email}</span>
        </div>
        <div className="dash-perfil-item">
          <span className="dash-perfil-label">Rol</span>
          <span className="dash-perfil-value">
            {user.role === 'Admin' ? 'Administrador' : 'Suscriptor'}
          </span>
        </div>
        <div className="dash-perfil-item">
          <span className="dash-perfil-label">Vencimiento de suscripción</span>
          <span className="dash-perfil-value">{fecha}</span>
        </div>
      </div>
    </>
  )
}