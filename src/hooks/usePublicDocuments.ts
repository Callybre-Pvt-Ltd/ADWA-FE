import { useQuery } from '@tanstack/react-query'
import { publicDocumentsService } from '../services'

export function usePublicDocuments(memberNumber: string, enabled: boolean) {
  return useQuery({
    queryKey: ['public-documents', memberNumber],
    queryFn: () => publicDocumentsService.getDocuments(memberNumber),
    enabled,
    staleTime: 0,
    retry: false,
  })
}
