import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import type { APIResponse } from '@/types/api.types'
import { decodeJwtPayload } from '@/utils/jwt'

export const ACCESS_TOKEN_KEY = 'adwa_access_token'
export const REFRESH_TOKEN_KEY = 'adwa_refresh_token'
export const USER_STORAGE_KEY = 'adwa_auth_user'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export { API_BASE_URL }

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

let refreshPromise: Promise<string | null> | null = null
let proactiveRefreshTimer: ReturnType<typeof setTimeout> | null = null

// Backing store for tokens. localStorage (not sessionStorage) so a login
// survives closing the tab/browser — required for the 7-day session to
// actually mean 7 days, not "until you close this tab".
const store = {
  get: (key: string) => localStorage.getItem(key),
  set: (key: string, value: string) => localStorage.setItem(key, value),
  remove: (key: string) => localStorage.removeItem(key),
}

// Fired when a refresh permanently fails (dead/expired refresh token) — the
// only way, previously, to notice this was every subsequent request 401ing
// forever until the user manually hit Logout. AuthContext subscribes to this
// to clear its user state so route guards redirect to login immediately.
type SessionExpiredListener = () => void
let sessionExpiredListener: SessionExpiredListener | null = null
export function onSessionExpired(listener: SessionExpiredListener) {
  sessionExpiredListener = listener
}

export function getAccessToken(): string | null {
  return store.get(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return store.get(REFRESH_TOKEN_KEY)
}

/** Refresh ~60s before the access token actually expires, so most requests never hit a 401 at all. */
function scheduleProactiveRefresh(accessToken: string) {
  if (proactiveRefreshTimer) clearTimeout(proactiveRefreshTimer)
  const payload = decodeJwtPayload(accessToken)
  if (!payload?.exp) return
  const msUntilExpiry = payload.exp * 1000 - Date.now()
  const fireIn = Math.max(msUntilExpiry - 60_000, 5_000)
  proactiveRefreshTimer = setTimeout(() => { void triggerRefresh() }, fireIn)
}

export function setTokens(accessToken: string, refreshToken: string) {
  store.set(ACCESS_TOKEN_KEY, accessToken)
  store.set(REFRESH_TOKEN_KEY, refreshToken)
  scheduleProactiveRefresh(accessToken)
}

export function clearTokens() {
  if (proactiveRefreshTimer) {
    clearTimeout(proactiveRefreshTimer)
    proactiveRefreshTimer = null
  }
  store.remove(ACCESS_TOKEN_KEY)
  store.remove(REFRESH_TOKEN_KEY)
  store.remove(USER_STORAGE_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const { data } = await axios.post<APIResponse<{
      access_token: string
      refresh_token: string
    }>>(`${API_BASE_URL}/auth/refresh`, { refresh_token: refreshToken })

    if (!data.success || !data.data) return null

    setTokens(data.data.access_token, data.data.refresh_token)
    return data.data.access_token
  } catch {
    return null
  }
}

// Single entry point for refreshing, used by both the 401 interceptor and the
// proactive timer, so concurrent callers share one in-flight request instead
// of racing separate /auth/refresh calls. On a genuine, permanent failure
// (dead/expired refresh token) this is also the one place that clears state
// and tells the rest of the app the session is over — previously nothing
// did, so the UI kept rendering "logged in" while every request 401ed.
function triggerRefresh(): Promise<string | null> {
  if (!getRefreshToken()) return Promise.resolve(null)
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .then((token) => {
        if (!token) {
          clearTokens()
          sessionExpiredListener?.()
          toast.error('Session expired. Please log in again.')
        }
        return token
      })
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

// Page reload with an existing session — re-arm the proactive timer so it's
// not purely reactive-on-401 until the next login/refresh happens to set it.
const existingAccessToken = getAccessToken()
if (existingAccessToken) scheduleProactiveRefresh(existingAccessToken)

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // FormData must not use the default application/json header — browser sets multipart boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error)
    }

    if (original.url?.includes('/auth/login') || original.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    original._retry = true

    const newToken = await triggerRefresh()
    if (!newToken) {
      return Promise.reject(error)
    }
    

    original.headers.Authorization = `Bearer ${newToken}`
    return apiClient(original)
  },
)

export function unwrapResponse<T>(response: APIResponse<T>): T {
  if (!response.success) {
    const message =
      typeof response.error === 'string'
        ? response.error
        : response.message || 'Request failed'
    throw new Error(message)
  }
  // Void endpoints (e.g. reset-password) return success with null data.
  return response.data as T
}

export function unwrapPaginated<T>(
  response: APIResponse<T[]>,
): { items: T[]; total: number; page: number; size: number; pages: number } {
  const items = unwrapResponse(response)
  const meta = response.metadata
  return {
    items,
    total: meta?.total ?? items.length,
    page: meta?.page ?? 1,
    size: meta?.size ?? items.length,
    pages: meta?.pages ?? 1,
  }
}
