import { api } from '@/lib/api'

export type Nft = {
  id: string
  name: string
  priceEth: string
  image: string
  availableEditions: number
  oldPriceEth?: string
}

type NftListResponse = {
  items: Nft[]
  total: number
}

export async function getNfts(): Promise<NftListResponse> {
  const response = await api.get<NftListResponse>('/nfts')

  return response.data
}