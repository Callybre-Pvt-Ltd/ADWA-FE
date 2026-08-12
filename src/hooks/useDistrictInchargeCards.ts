import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { districtInchargeCardsService } from '../services'
import type {
  ListDistrictInchargeCardsFilters,
  UpdateDistrictInchargeCardInput,
} from '../services/api/districtInchargeCards.service'

export const DISTRICT_INCHARGE_CARDS_QUERY_KEY = ['district-incharge-cards'] as const

export function useDistrictInchargeCardList(filters?: ListDistrictInchargeCardsFilters) {
  return useQuery({
    queryKey: [...DISTRICT_INCHARGE_CARDS_QUERY_KEY, 'list', filters],
    queryFn: () => districtInchargeCardsService.list(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}

export function useUpdateDistrictInchargeCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDistrictInchargeCardInput }) =>
      districtInchargeCardsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISTRICT_INCHARGE_CARDS_QUERY_KEY })
      toast.success('Card updated')
    },
    onError: (err: Error) => toast.error(`Update failed: ${err.message}`),
  })
}

export function useUploadDistrictInchargeCardPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      districtInchargeCardsService.uploadPhoto(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DISTRICT_INCHARGE_CARDS_QUERY_KEY })
    },
    onError: (err: Error) => toast.error(`Photo upload failed: ${err.message}`),
  })
}
