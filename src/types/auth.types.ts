export type AuthRole = 'district' | 'admin'

export type AuthUser = {
  id?: string
  role: AuthRole
  email: string
  name: string
  districtId?: string | null
  backendRole?: 'SUPER_ADMIN' | 'DISTRICT_INCHARGE'
}
