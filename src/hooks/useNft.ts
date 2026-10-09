
import { useQuery } from '@tanstack/react-query'
import { getNftById } from '@/services/nfts'

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => getNftById(id, signal),
    enabled: Boolean(id),
  })
}