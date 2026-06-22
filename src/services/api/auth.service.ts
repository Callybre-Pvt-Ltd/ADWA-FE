import {
  apiClient,
  clearTokens,
  setTokens,
  unwrapResponse,
  USER_STORAGE_KEY,
} from './client'
import type { APIResponse } from '@/types/api.types'
import type { AuthRole, AuthUser } from '@/types/auth.types'
import { decodeJwtPayload } from '@/utils/jwt'

type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

type LoginResponse = {
  user_id: string
  full_name: string
  role: 'SUPER_ADMIN' | 'DISTRICT_INCHARGE'
  district_id: string | null
  tokens: TokenPair
}

function mapBackendRole(role: string): AuthRole {
  if (role === 'SUPER_ADMIN') return 'admin'
  if (role === 'DISTRICT_INCHARGE') return 'district'
  throw new Error('Unsupported user role')
}

function buildAuthUser(
  login: LoginResponse,
  identifier: string,
): AuthUser {
  return {
    id: login.user_id,
    role: mapBackendRole(login.role),
    email: identifier.includes('@') ? identifier : '',
    name: login.full_name,
    districtId: login.district_id,
    backendRole: login.role,
  }
}

function buildAuthUserFromToken(accessToken: string, stored?: AuthUser | null): AuthUser | null {
  const payload = decodeJwtPayload(accessToken)
  if (!payload?.sub || !payload.role) return stored ?? null

  return {
    id: payload.sub,
    role: mapBackendRole(payload.role),
    email: stored?.email ?? '',
    name: stored?.name ?? 'User',
    districtId: payload.district_id ?? null,
    backendRole: payload.role as AuthUser['backendRole'],
  }
}

export const authService = {
  async login(identifier: string, password: string, expectedRole: AuthRole): Promise<AuthUser> {
    const { data } = await apiClient.post<APIResponse<LoginResponse>>('/auth/login', {
      identifier,
      password,
    })
    const login = unwrapResponse(data)
    const user = buildAuthUser(login, identifier)

    if (user.role !== expectedRole) {
      throw new Error('Invalid credentials for this portal')
    }

    setTokens(login.tokens.access_token, login.tokens.refresh_token)
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    return user
  },

  async refresh(): Promise<void> {
    const refreshToken = sessionStorage.getItem('adwa_refresh_token')
    if (!refreshToken) throw new Error('No refresh token')

    const { data } = await apiClient.post<APIResponse<TokenPair>>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    const tokens = unwrapResponse(data)
    setTokens(tokens.access_token, tokens.refresh_token)
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      clearTokens()
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data } = await apiClient.post<APIResponse<null>>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    unwrapResponse(data)
  },

  restoreUser(): AuthUser | null {
    try {
      const accessToken = sessionStorage.getItem('adwa_access_token')
      if (!accessToken) return null

      const raw = sessionStorage.getItem(USER_STORAGE_KEY)
      const stored = raw ? (JSON.parse(raw) as AuthUser) : null
      return buildAuthUserFromToken(accessToken, stored)
    } catch {
      return null
    }
  },
}
