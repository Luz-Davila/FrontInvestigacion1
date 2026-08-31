const API = 'https://localhost:7005'

export interface Servicio {
  id: string
  nombre: string
  duracionMinutos: number
  precio: number
  activo: boolean
}

export interface Dermatologo {
  id: string
  nombre: string
  especialidad: string | null
}

export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number
  email: string
}

export interface RegisterData {
  nombre: string
  email: string
  password: string
  telefono?: string
  fechaNacimiento?: string
}

export interface CitaData {
  servicioId: string
  dermatologoId: string
  fechaHora: string
  notas?: string
}

export async function getServicios(): Promise<Servicio[]> {
  const res = await fetch(`${API}/servicios`)
  if (!res.ok) throw new Error('Error al cargar servicios')
  return res.json()
}

export async function getDermatologos(): Promise<Dermatologo[]> {
  const res = await fetch(`${API}/dermatologos`)
  if (!res.ok) throw new Error('Error al cargar dermatólogos')
  return res.json()
}

export async function register(data: RegisterData): Promise<{ id: number; email: string }> {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Error al registrar')
  return body
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = await res.json()
  if (!res.ok) {
    if (res.status === 401) throw new Error('Credenciales incorrectas')
    throw new Error(body.message || 'Error al iniciar sesión')
  }
  return body
}

export async function crearCita(token: string, data: CitaData): Promise<{ id: string; mensaje: string }> {
  const res = await fetch(`${API}/citas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Error al agendar la cita')
  return body
}
