import { API_BASE_URL } from './client'
import type { APIResponse } from '@/types/api.types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SnakeRecord = Record<string, any>

export function toCamelCase<T>(obj: SnakeRecord): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        value !== null && typeof value === 'object' && !Array.isArray(value)
          ? toCamelCase(value)
          : value,
      ]),
    ) as T
  }
  return obj as T
}

export function buildQueryParams(params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export async function extractError(error: unknown): Promise<Error> {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: APIResponse<unknown> & { error?: { details?: unknown } } }
      message?: string
      code?: string
    }
    const data = axiosError.response?.data
    const details = data?.error && typeof data.error === 'object' && 'details' in data.error
      ? data.error.details
      : undefined
    if (typeof details === 'string' && details) {
      const short = details.split('\n')[0]
      return new Error(short.length > 200 ? data?.message ?? short.slice(0, 200) : short)
    }
    if (data?.message) return new Error(data.message)
    if (typeof data?.error === 'string') return new Error(data.error)
  }
  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      return new Error(
        `Cannot reach the API server (${API_BASE_URL}). Make sure the backend is running.`,
      )
    }
    return error
  }
  return new Error('An unexpected error occurred')
}
