import { useState, useEffect } from 'react'
import {
  getCitas,
  getTratamientos,
  getCitaTratamientos,
  crearCitaTratamiento,
  eliminarCitaTratamiento,
  type CitaResponse,
  type Tratamiento,
  type CitaTratamiento,
} from './api'

export default function DashboardCitasAdmin() {
  const [citas, setCitas] = useState<CitaResponse[]>([])
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([])
  const [asignaciones, setAsignaciones] = useState<CitaTratamiento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [seleccion, setSeleccion] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const cargar = () => {
    setLoading(true)
    setError('')
    Promise.all([getCitas(), getTratamientos(), getCitaTratamientos()])
      .then(([c, t, a]) => {
        setCitas(c)
        setTratamientos(t)
        setAsignaciones(a)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Error al cargar citas'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar()
  }, [])

  const yaAsignado = (citaId: string, tratamientoId: string) =>
    asignaciones.some((a) => a.citaId === citaId && a.tratamientoId === tratamientoId)

  const idAsignacion = (citaId: string, tratamientoId: string) =>
    asignaciones.find((a) => a.citaId === citaId && a.tratamientoId === tratamientoId)?.id

  const disponibles = (citaId: string) =>
    tratamientos.filter((t) => !yaAsignado(citaId, t.id))

  const handleAgregar = async (citaId: string) => {
    const tratamientoId = seleccion[citaId]
    if (!tratamientoId) return
    setBusy(true)
    setError('')
    try {
      await crearCitaTratamiento({ citaId, tratamientoId })
      setSeleccion((s) => ({ ...s, [citaId]: '' }))
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al asignar el tratamiento'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  const handleQuitar = async (citaId: string, tratamientoId: string) => {
    const id = idAsignacion(citaId, tratamientoId)
    if (!id) return
    setBusy(true)
    setError('')
    try {
      await eliminarCitaTratamiento(id)
      cargar()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al quitar el tratamiento'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 className="dash-section-title">Agenda / Citas</h2>
      {loading && <p className="cita-loading">Cargando citas...</p>}
      {error && <div className="dash-error">{error}</div>}
      {!loading && !error && citas.length === 0 && (
        <p className="dash-empty">No hay citas registradas.</p>
      )}
      {!loading && !error && citas.length > 0 && (
        <div className="dash-citas-list">
          {citas.map((cita) => (
            <div key={cita.id} className="dash-cita-card">
              <div className="dash-cita-header">
                <span className="dash-cita-estado">{cita.estado}</span>
                <span className="dash-cita-fecha">
                  {new Date(cita.fechaHora).toLocaleDateString('es-CR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                  {' '}
                  {new Date(cita.fechaHora).toLocaleTimeString('es-CR', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="dash-cita-body">
                <p><strong>Servicio:</strong> {cita.servicio.nombre}</p>
                <p><strong>Dermatólogo:</strong> {cita.dermatologo.nombre}</p>
                <p><strong>Paciente:</strong> {cita.paciente.nombre}</p>
                {cita.notas && (
                  <p className="dash-cita-notas"><strong>Notas:</strong> {cita.notas}</p>
                )}

                <div className="dash-tratamientos-block">
                  <p className="dash-tratamientos-title"><strong>Tratamientos</strong></p>
                  {cita.tratamientos.length === 0 && (
                    <p className="dash-empty">Sin tratamientos asignados.</p>
                  )}
                  {cita.tratamientos.map((t) => (
                    <div key={`${cita.id}-${t.id}`} className="dash-tratamiento-item">
                      <span className="dash-tratamiento-nombre">{t.nombre}</span>
                      {t.observaciones && (
                        <span className="dash-tratamiento-obs">{t.observaciones}</span>
                      )}
                      <button
                        type="button"
                        className="dash-btn dash-btn-danger"
                        disabled={busy}
                        onClick={() => handleQuitar(cita.id, t.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>

                <div className="dash-asignar-row">
                  <select
                    className="dash-select"
                    value={seleccion[cita.id] ?? ''}
                    onChange={(e) => setSeleccion((s) => ({ ...s, [cita.id]: e.target.value }))}
                  >
                    <option value="">Selecciona un tratamiento</option>
                    {disponibles(cita.id).map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary"
                    disabled={busy || !seleccion[cita.id]}
                    onClick={() => handleAgregar(cita.id)}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}