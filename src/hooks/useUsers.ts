import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService } from '../services'
import type { CreateUserDto, UpdateUserDto, UserFilters } from '../types/user.types'
import { toast } from 'sonner'

export const USERS_QUERY_KEY = ['users'] as const

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],
    queryFn: () => usersService.list({ ...filters, role: 'DISTRICT_INCHARGE' }),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateUserDto) => usersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User created')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User updated')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useDeactivateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersService.deactivate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USERS_QUERY_KEY })
      toast.success('User deactivated')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      usersService.resetPassword(id, password),
    onSuccess: () => toast.success('Password reset'),
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}
