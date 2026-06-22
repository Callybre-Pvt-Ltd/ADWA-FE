import { useQuery, useMutation } from '@tanstack/react-query'
import { cardsService } from '../services'
import { toast } from 'sonner'

export const CARDS_QUERY_KEY = ['cards'] as const

export function useCards() {
  return useQuery({
    queryKey: CARDS_QUERY_KEY,
    queryFn: () => cardsService.list({ size: 100 }),
    staleTime: 1000 * 60 * 5,
  })
}

export function useDownloadCard() {
  return useMutation({
    mutationFn: (cardId: string) => cardsService.getDownloadUrl(cardId),
    onSuccess: ({ downloadUrl }) => {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer')
      toast.success('Card download started')
    },
    onError: (err: Error) => toast.error(`Download failed: ${err.message}`),
  })
}
