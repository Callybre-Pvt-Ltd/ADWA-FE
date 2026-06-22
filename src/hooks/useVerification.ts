import { useQuery } from '@tanstack/react-query'
import { verificationService } from '../services/api/verification.service'

export function useVerifyCard(code: string) {
  return useQuery({
    queryKey: ['verification', code],
    queryFn: () => verificationService.verify(code),
    enabled: !!code,
    retry: false,
  })
}
