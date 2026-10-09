
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
}

export type NftEdition = {
  id: string
  label: string
  availableQuantity: number
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
