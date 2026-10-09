
import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { getNftById } from '@/services/nfts'

export function useNft(id: string) {
  return useQuery({
    queryKey: ['nft', id],
    queryFn: ({ signal }) => getNftById(id, signal),
    enabled: Boolean(id),
    // Recurso inexistente é resposta definitiva: exibir o estado de erro
    // imediatamente, sem esgotar as tentativas padrão de rede.
    retry: (failureCount, error) =>
      !(isAxiosError(error) && error.response?.status === 404) &&
      failureCount < 3,
  })
}
