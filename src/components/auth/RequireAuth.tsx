import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type AuthRole } from '@/context/AuthContext'

interface RequireAuthProps {
  role: AuthRole
  loginPath: string
  children: ReactNode
}

export function RequireAuth({ role, loginPath, children }: RequireAuthProps) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated(role)) {
    return <Navigate to={loginPath} replace state={{ from: location.pathname }} />
  }

  return children
}
