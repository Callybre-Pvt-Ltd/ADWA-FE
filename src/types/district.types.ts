export type District = {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
  contactPhone?: string | null
}

export type CreateDistrictDto = {
  name: string
  code?: string
  status: 'active' | 'inactive'
  contactPhone?: string | null
}
