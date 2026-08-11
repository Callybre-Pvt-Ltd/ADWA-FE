/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import { onSessionExpired, USER_STORAGE_KEY } from '@/services/api/client'
import type { AuthRole, AuthUser } from '@/types/auth.types'

export type { AuthRole, AuthUser }

type AuthContextValue = {
  user: AuthUser | null
  login: (role: AuthRole, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: (role: AuthRole) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.restoreUser())

  const login = useCallback(async (role: AuthRole, email: string, password: string) => {
    const next = await authService.login(email, password, role)
    setUser(next)
  }, [])

  const logout = useCallback(() => {
    void authService.logout().catch(() => { /* best-effort — tokens are cleared regardless */ })
    localStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
  }, [])

  // A refresh that permanently fails (dead/expired refresh token) previously
  // left the UI thinking it was still logged in — every request would 401
  // forever until the user manually clicked Logout. This makes that state
  // recoverable: the client clears tokens and tells us to drop `user` too, so
  // RequireAuth's normal "not authenticated" redirect kicks in immediately.
  useEffect(() => {
    onSessionExpired(() => setUser(null))
  }, [])

  const isAuthenticated = useCallback((role: AuthRole) => user?.role === role, [user])

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
