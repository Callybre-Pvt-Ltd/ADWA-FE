import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { districtInchargeCardsService } from '../services'
import type { ListDistrictInchargeCardsFilters } from '../services/api/districtInchargeCards.service'

export const DISTRICT_INCHARGE_CARDS_QUERY_KEY = ['district-incharge-cards'] as const

export function useDistrictInchargeCardList(filters?: ListDistrictInchargeCardsFilters) {
  return useQuery({
    queryKey: [...DISTRICT_INCHARGE_CARDS_QUERY_KEY, 'list', filters],
    queryFn: () => districtInchargeCardsService.list(filters),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  })
}
