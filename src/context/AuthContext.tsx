import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export type AuthRole = 'district' | 'admin'

export type AuthUser = {
  role: AuthRole
  email: string
  name: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (role: AuthRole, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: (role: AuthRole) => boolean
}

const STORAGE_KEY = 'adwa_auth'

const MOCK_CREDENTIALS: Record<AuthRole, { email: string; password: string; name: string }> = {
  district: {
    email: 'district@adwa.org',
    password: 'district123',
    name: 'District Incharge',
  },
  admin: {
    email: 'admin@adwa.org',
    password: 'admin123',
    name: 'Super Admin',
  },
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())

  const login = useCallback(async (role: AuthRole, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600))
    const creds = MOCK_CREDENTIALS[role]
    if (email.trim().toLowerCase() !== creds.email || password !== creds.password) {
      throw new Error('Invalid email or password')
    }
    const next: AuthUser = { role, email: creds.email, name: creds.name }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const isAuthenticated = useCallback(
    (role: AuthRole) => user?.role === role,
    [user],
  )

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated }),
    [user, login, logout, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getMockCredentials(role: AuthRole) {
  return MOCK_CREDENTIALS[role]
}
