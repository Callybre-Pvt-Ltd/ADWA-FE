export type District = {
  id: string
  name: string
  code: string
  status: 'active' | 'inactive'
}

export type CreateDistrictDto = {
  name: string
  code?: string
  status: 'active' | 'inactive'
}
