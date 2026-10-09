import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { getNfts } from '@/services/nfts'

export function useNfts() {
  const search = useSearch({ from: '/' })

  return useQuery({
    queryKey: ['nfts', search],
    queryFn: ({ signal }) => getNfts(search, signal),
  })
}