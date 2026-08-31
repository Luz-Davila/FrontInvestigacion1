const API = 'https://localhost:7005'

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token')

  const res = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!res.ok) {
    throw new Error('Refresh inválido')
  }

  const data = await res.json()
  localStorage.setItem('authToken', data.token)
  localStorage.setItem('refreshToken', data.refreshToken)
  return data.token
}

async function authFetch(
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> {
  const token = localStorage.getItem('authToken')
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res = await fetch(input, { ...init, headers })

  if (res.status === 401) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
      }
      const newToken = await refreshPromise
      refreshPromise = null

      headers.set('Authorization', `Bearer ${newToken}`)
      res = await fetch(input, { ...init, headers })
    } catch {
      refreshPromise = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      throw new Error('Sesión expirada')
    }
  }

  return res
}

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

export interface CurrentUser {
  id: number
  nombre: string | null
  email: string
  role: string
  isActive: boolean
  subscriptionExpirationDate: string | null
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
  const text = await res.text()
  if (!res.ok) {
    let message = 'Error al iniciar sesión'
    try { message = JSON.parse(text).message || message } catch { /* empty */ }
    if (res.status === 401) message = 'Credenciales incorrectas'
    throw new Error(message)
  }
  if (!text) throw new Error('Respuesta vacía del servidor')
  return JSON.parse(text)
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await authFetch(`${API}/users/me`)
  if (!res.ok) {
    throw new Error('Sesión expirada')
  }
  return res.json()
}

export async function logoutApi(): Promise<void> {
  await authFetch(`${API}/auth/logout`, { method: 'POST' })
}

export async function crearCita(data: CitaData): Promise<{ id: string; mensaje: string }> {
  const res = await authFetch(`${API}/citas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.message || 'Error al agendar la cita')
  return body
}

export interface CitaResponse {
  id: string
  fechaHora: string
  estado: string
  notas: string | null
  servicio: { id: string; nombre: string }
  dermatologo: { id: string; nombre: string; especialidad: string | null }
  paciente: { id: string; nombre: string; telefono: string | null }
  tratamientos: { id: string; nombre: string; observaciones: string | null }[]
}

export async function getCitas(): Promise<CitaResponse[]> {
  const res = await authFetch(`${API}/citas`)
  if (!res.ok) {
    const text = await res.text()
    let message = 'Error al cargar citas'
    try { message = JSON.parse(text).message || message } catch { /* empty */ }
    if (res.status === 401) throw new Error('Sesión expirada')
    if (res.status === 403) throw new Error('No tienes permiso para ver estas citas')
    throw new Error(message)
  }
  return res.json()
}
