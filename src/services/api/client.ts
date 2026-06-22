import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { APIResponse } from '@/types/api.types'

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

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(USER_STORAGE_KEY)
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
    clearTokens()
    return null
  }
}

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

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const newToken = await refreshPromise
    if (!newToken) {
      clearTokens()
      return Promise.reject(error)
    }

    original.headers.Authorization = `Bearer ${newToken}`
    return apiClient(original)
  },
)

export function unwrapResponse<T>(response: APIResponse<T>): T {
  if (!response.success || response.data === null || response.data === undefined) {
    const message =
      typeof response.error === 'string'
        ? response.error
        : response.message || 'Request failed'
    throw new Error(message)
  }
  return response.data
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
