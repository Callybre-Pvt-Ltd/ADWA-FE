export type UserRole = 'SUPER_ADMIN' | 'DISTRICT_INCHARGE'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export type User = {
  id: string
  fullName: string
  email: string
  mobileNumber: string
  role: UserRole
  status: UserStatus
  districtId: string | null
  lastLoginAt: string | null
  createdAt: string
}

export type CreateUserDto = {
  fullName: string
  email: string
  mobileNumber: string
  password: string
  role: UserRole
  districtId?: string | null
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>> & {
  status?: UserStatus
}

export type UserFilters = {
  search?: string
  role?: UserRole
  status?: UserStatus
  districtId?: string
  page?: number
  size?: number
}
