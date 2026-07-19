/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authService } from '@/services'
import { USER_STORAGE_KEY } from '@/services/api/client'
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
    void authService.logout()
    sessionStorage.removeItem(USER_STORAGE_KEY)
    setUser(null)
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
