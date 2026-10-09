import { useQuery } from '@tanstack/react-query'
import type { CartQuote } from '@/services/marketplace'
import type { NftUpdatedEvent } from '@/services/nfts'
import { NFT_EVENTS_KEY, type NftEventFeed } from './applyRealtimeEvents'

/**
 * Feed somente leitura dos eventos `nft.updated` recebidos pelo cliente
 * Socket.IO. O cache é preenchido exclusivamente pelo handler de eventos —
 * nunca por caminhos alternativos de estado.
 */
export function useNftRealtimeEvents(): NftUpdatedEvent[] {
  const feed = useQuery<NftEventFeed>({
    queryKey: NFT_EVENTS_KEY,
    queryFn: () => [],
    staleTime: Infinity,
    gcTime: Infinity,
  })
  return feed.data ?? []
}

/** Evento mais recente que afeta algum dos NFTs informados. */
export function useLatestNftEvent(nftIds: readonly string[]): NftUpdatedEvent | undefined {
  const events = useNftRealtimeEvents()
  return events.find((event) => nftIds.includes(event.nftId))
}

/**
 * Uma cotação está desatualizada quando um evento de atualização de NFT do
 * carrinho chegou depois de o valor ter sido calculado. A invalidação
 * disparada pelo próprio evento refetch a cotação pela API REST; enquanto a
 * cotação nova não chega, o checkout permanece bloqueado.
 */
export function useQuoteStale(quote: CartQuote | undefined): boolean {
  const events = useNftRealtimeEvents()
  if (!quote?.quotedAt) return false

  const quotedAt = new Date(quote.quotedAt).getTime()
  const nftIds = quote.lines.map((line) => line.nftId)

  return events.some((event) => {
    if (!nftIds.includes(event.nftId)) return false
    return event.receivedAt > quotedAt
  })
}
