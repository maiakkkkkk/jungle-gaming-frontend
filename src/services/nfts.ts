
import { api } from '@/lib/api'
import type { CatalogSearch } from '@/router'

export type Nft = {
  id: string
  name: string
  price: string
  oldPrice?: string
  currency: 'ETH' | 'POL' | 'SOL'
  image: string
  availableEditions: number
  editions?: NftEdition[]
  collection: string
  collectionName?: string
  network: string
  description?: string
  attributes?: string[]
  contractAddress?: string
  creatorRoyalty?: string
  rating?: number
  reviewCount?: number
  /** Versão monotônica do recurso, incrementada a cada atualização em tempo real. */
  version?: number
  updatedAt?: string
}

export type NftEdition = {
  id: string
  label: string
  availableQuantity: number
}

export type NftUpdatedEvent = {
  /** Identidade estável do recurso afetado. */
  id: string
  nftId: string
  /** Versão monotônica: duplicatas e eventos antigos são descartados. */
  version: number
  price?: string
  oldPrice?: string | null
  currency?: string
  availableEditions?: number
  editions?: NftEdition[]
  updatedAt: string
  /** Marca de chegada no cliente, usada para detectar cotações desatualizadas. */
  receivedAt: number
}

export type OrderUpdatedEvent = {
  /** Identidade estável do pedido afetado. */
  id: string
  orderId: string
  /** Dono do pedido; eventos de outros usuários são ignorados. */
  ownerId: string
  version: number
  status: 'pending' | 'confirmed' | 'declined'
  transactionId?: string
  declineReason?: string
  updatedAt: string
  receivedAt: number
}

export type NftListResponse = {
  items: Nft[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getNfts(
  params: CatalogSearch,
  signal?: AbortSignal,
): Promise<NftListResponse> {
  const response = await api.get<NftListResponse>('/nfts', {
    params,
    signal,
  })

  return response.data
}

export async function getNftById(
  id: string,
  signal?: AbortSignal,
): Promise<Nft> {
  const response = await api.get<Nft>(
    `/nfts/${encodeURIComponent(id)}`,
    { signal },
  )

  return response.data
}
