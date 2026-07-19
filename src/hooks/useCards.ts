import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cardsService } from '../services'
import { toast } from 'sonner'

export const CARDS_QUERY_KEY = ['cards'] as const

export function useCards() {
  return useQuery({
    queryKey: CARDS_QUERY_KEY,
    queryFn: () => cardsService.list({ size: 100 }),
    staleTime: 1000 * 60 * 2,
  })
}

export function useCardSnapshot(cardId: string | null) {
  return useQuery({
    queryKey: [...CARDS_QUERY_KEY, 'snapshot', cardId],
    queryFn: () => cardsService.getSnapshot(cardId!),
    enabled: !!cardId,
  })
}

export function useGenerateIdCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: Record<string, unknown> }) =>
      cardsService.generate(cardId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CARDS_QUERY_KEY })
      qc.invalidateQueries({ queryKey: ['drivers'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useDownloadCard() {
  return useMutation({
    mutationFn: (cardId: string) => cardsService.downloadPdf(cardId),
    onSuccess: () => {
      toast.success('Card download started')
    },
    onError: (err: Error) => toast.error(`Download failed: ${err.message}`),
  })
}

export function useUploadCardPhoto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cardId, file }: { cardId: string; file: File }) =>
      cardsService.uploadPhoto(cardId, file),
    onSuccess: (_data, { cardId }) => {
      qc.invalidateQueries({ queryKey: [...CARDS_QUERY_KEY, 'snapshot', cardId] })
      toast.success('Photo uploaded successfully')
    },
    onError: (err: Error) => toast.error(`Photo upload failed: ${err.message}`),
  })
}
