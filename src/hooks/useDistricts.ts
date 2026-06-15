import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { districtsService } from '../services/mock/districts.service'
import type { CreateDistrictDto } from '../types/district.types'
import { toast } from 'sonner'

export const DISTRICTS_QUERY_KEY = ['districts'] as const

export function useDistricts() {
  return useQuery({
    queryKey: DISTRICTS_QUERY_KEY,
    queryFn: () => districtsService.getAll(),
    staleTime: 1000 * 60 * 10,
  })
}

export function useCreateDistrict() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDistrictDto) => districtsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISTRICTS_QUERY_KEY })
      toast.success('District created')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}

export function useUpdateDistrict() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDistrictDto> }) =>
      districtsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISTRICTS_QUERY_KEY })
      toast.success('District updated')
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`),
  })
}
