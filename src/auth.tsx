import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import {
  login as apiLogin,
  getCurrentUser,
  logoutApi,
  type CurrentUser,
} from './api'

interface AuthState {
  user: CurrentUser | null
  token: string | null
  loading: boolean
  isAdmin: boolean
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'))
  const [loading, setLoading] = useState(() => !!localStorage.getItem('authToken'))
  const [sessionExpired, setSessionExpired] = useState(false)
  const skipNextEffect = useRef(false)

  useEffect(() => {
    if (!token || skipNextEffect.current) {
      skipNextEffect.current = false
      setLoading(false)
      return
    }
    setLoading(true)
    getCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        setToken(null)
        setSessionExpired(true)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email: string, password: string) => {
    setSessionExpired(false)
    const res = await apiLogin(email, password)
    localStorage.setItem('authToken', res.token)
    localStorage.setItem('refreshToken', res.refreshToken)
    const u = await getCurrentUser()
    skipNextEffect.current = true
    setToken(res.token)
    setUser(u)
  }

  const logout = async () => {
    if (token) {
      await logoutApi().catch(() => {})
    }
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.role === 'Admin'

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin, sessionExpired, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  return useAuthContext()
}
