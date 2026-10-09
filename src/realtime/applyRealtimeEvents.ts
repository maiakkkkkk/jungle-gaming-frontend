import type { QueryClient } from '@tanstack/react-query'
import type {
  Nft,
  NftListResponse,
  NftUpdatedEvent,
  OrderUpdatedEvent,
} from '@/services/nfts'
import type { Order } from '@/services/marketplace'
import { clearPendingOrderAttempt } from '@/lib/pendingOrder'

export const NFT_EVENTS_KEY = ['realtime', 'nft-events'] as const
export const ORDER_EVENTS_KEY = ['realtime', 'order-events'] as const
const EVENT_FEED_LIMIT = 20

export type NftEventFeed = NftUpdatedEvent[]
export type OrderEventFeed = OrderUpdatedEvent[]

/** Últimas versões aplicadas por recurso; protege contra duplicatas e eventos antigos. */
const appliedNftVersions = new Map<string, number>()
const appliedOrderVersions = new Map<string, number>()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isNftUpdatedEvent(value: unknown): value is NftUpdatedEvent {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.nftId === 'string' &&
    typeof value.version === 'number' &&
    Number.isFinite(value.version) &&
    typeof value.updatedAt === 'string'
  )
}

export function isOrderUpdatedEvent(value: unknown): value is OrderUpdatedEvent {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.orderId === 'string' &&
    typeof value.ownerId === 'string' &&
    typeof value.version === 'number' &&
    Number.isFinite(value.version) &&
    (value.status === 'pending' ||
      value.status === 'confirmed' ||
      value.status === 'declined') &&
    typeof value.updatedAt === 'string'
  )
}

function patchNftFromEvent(nft: Nft, event: NftUpdatedEvent): Nft {
  return {
    ...nft,
    price: event.price ?? nft.price,
    oldPrice: event.oldPrice === null ? undefined : event.oldPrice ?? nft.oldPrice,
    currency:
      event.currency === 'ETH' || event.currency === 'POL' || event.currency === 'SOL'
        ? event.currency
        : nft.currency,
    availableEditions: event.availableEditions ?? nft.availableEditions,
    editions: event.editions ?? nft.editions,
    version: event.version,
    updatedAt: event.updatedAt,
  }
}

/**
 * Aplica `nft.updated` ao cache: catálogo, detalhe e registro de eventos.
 * Cotação e carrinho são reconciliados pela API REST (invalidação), mantendo
 * a resposta do servidor como fonte de verdade. Retorna `false` para eventos
 * duplicados ou antigos, que não podem regredir o estado.
 */
export function applyNftUpdatedEvent(
  queryClient: QueryClient,
  raw: unknown,
): NftUpdatedEvent | null {
  if (!isNftUpdatedEvent(raw)) return null
  const event: NftUpdatedEvent = { ...raw, receivedAt: Date.now() }

  const applied = appliedNftVersions.get(event.nftId)
  if (applied !== undefined && event.version <= applied) return null

  appliedNftVersions.set(event.nftId, event.version)

  queryClient.setQueriesData<NftListResponse>({ queryKey: ['nfts'] }, (page) =>
    page
      ? {
          ...page,
          items: page.items.map((item) =>
            item.id === event.nftId && (item.version ?? 0) < event.version
              ? patchNftFromEvent(item, event)
              : item,
          ),
        }
      : page,
  )

  const detail = queryClient.getQueryData<Nft>(['nft', event.nftId])
  if (detail && (detail.version ?? 0) < event.version) {
    queryClient.setQueryData<Nft>(['nft', event.nftId], patchNftFromEvent(detail, event))
  }

  queryClient.setQueryData<NftEventFeed>(NFT_EVENTS_KEY, (feed) =>
    [event, ...(feed ?? [])].slice(0, EVENT_FEED_LIMIT),
  )

  void queryClient.invalidateQueries({ queryKey: ['cartQuote'] })
  return event
}

/**
 * Aplica `order.updated` ao cache do pedido. Eventos de outro usuário são
 * ignorados (isolamento por sessão); duplicatas e eventos antigos não regredem
 * o estado nem reaplicam efeitos.
 */
export function applyOrderUpdatedEvent(
  queryClient: QueryClient,
  raw: unknown,
  currentUserId: string | null,
): OrderUpdatedEvent | null {
  if (!isOrderUpdatedEvent(raw)) return null
  const event: OrderUpdatedEvent = { ...raw, receivedAt: Date.now() }

  if (currentUserId && event.ownerId !== currentUserId) return null

  const ownerId = currentUserId ?? 'guest'
  const queryKey = ['order', ownerId, event.orderId] as const
  const cached = queryClient.getQueryData<Order>(queryKey)

  const applied = appliedOrderVersions.get(event.orderId)
  if (applied !== undefined && event.version <= applied) return null
  if (cached?.version !== undefined && event.version <= cached.version) return null

  appliedOrderVersions.set(event.orderId, event.version)

  if (cached) {
    queryClient.setQueryData<Order>(queryKey, {
      ...cached,
      status: event.status,
      transactionId: event.transactionId ?? cached.transactionId,
      declineReason: event.declineReason ?? cached.declineReason,
      version: event.version,
    })
  }

  queryClient.setQueryData<OrderEventFeed>(ORDER_EVENTS_KEY, (feed) =>
    [event, ...(feed ?? [])].slice(0, EVENT_FEED_LIMIT),
  )

  // Pedidos confirmados ou recusados são terminais: libera a tentativa local.
  if (event.status !== 'pending') {
    clearPendingOrderAttempt(event.orderId)
  }

  return event
}

/**
 * Reconcilia os recursos ativos com a API REST após a conexão
 * (inclusive cada reconexão), descartando estado que possa ter ficado
 * defasado durante a desconexão.
 */
export function reconcileActiveResources(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: ['nfts'] })
  void queryClient.invalidateQueries({ queryKey: ['nft'] })
  void queryClient.invalidateQueries({ queryKey: ['cartQuote'] })

  for (const query of queryClient.getQueryCache().getAll()) {
    if (query.queryKey[0] !== 'order') continue
    const data = query.state.data as Order | undefined
    if (data?.status === 'pending') {
      void queryClient.invalidateQueries({ queryKey: query.queryKey })
    }
  }
}
