export type PaginationMetadata = {
  total: number | null
  page: number | null
  size: number | null
  pages: number | null
  request_id?: string | null
}

export type APIResponse<T> = {
  success: boolean
  status: number
  message: string
  data: T | null
  error: unknown
  metadata: PaginationMetadata | null
}

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}
