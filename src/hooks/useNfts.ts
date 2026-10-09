import { useQuery } from '@tanstack/react-query'
import { getNfts } from '@/services/nfts'

export function useNfts() {
  return useQuery({
    queryKey: ['nfts'],
    queryFn: getNfts,
  })
}