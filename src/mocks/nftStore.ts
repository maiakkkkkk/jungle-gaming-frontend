import type { Nft, NftEdition } from '@/services/nfts'
import { broadcastNftUpdated } from './socketBus'

/**
 * Catálogo simulado compartilhado entre os handlers REST e o servidor de
 * eventos Socket.IO. Toda alteração de preço ou estoque passa por
 * `applyNftUpdate`, que incrementa a versão, persiste o delta e emite o
 * evento `nft.updated`, mantendo REST e eventos coerentes entre si.
 */
export const nfts: Nft[] = [
  {
    id: 'nft-03',
    name: 'Emerald Ape #042',
    price: '1.19',
    image: '/assets/images/NFT%20Artwork%2003.png',
    availableEditions: 12,
    editions: [
      { id: '1-50', label: '1/50', availableQuantity: 12 },
    ],
    collection: 'Arte digital',
    collectionName: 'Kurio Apes',
    network: 'Ethereum',
    currency: 'ETH',
    description:
      'Um colecionável digital finalizado à mão da coleção Kurio Editions, verificado na Ethereum, com arte desbloqueável e acesso para colecionadores.',
    attributes: ['Óculos', 'Esmeralda', 'Raro'],
    contractAddress: '0x7A42...19E8',
    creatorRoyalty: '5%',
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: 'nft-04',
    name: 'Sage Nomad #009',
    price: '1.69',
    image: '/assets/images/NFT%20Artwork%2004.png',
    availableEditions: 8,
    collection: 'Fotografia',
    network: 'Ethereum',
    currency: 'ETH',
  },
  {
    id: 'nft-05',
    name: 'Neon Vessel #552',
    price: '1.99',
    oldPrice: '2.29',
    image: '/assets/images/NFT%20Artwork%2005.png',
    availableEditions: 5,
    collection: 'Música',
    network: 'Ethereum',
    currency: 'ETH',
  },
  {
    id: 'nft-06',
    name: 'Cosmic Bloom #118',
    price: '1.29',
    image: '/assets/images/NFT%20Artwork%2006.png',
    availableEditions: 10,
    collection: 'Arte 3D',
    network: 'Polygon',
    currency: 'POL',
  },
  {
    id: 'nft-07',
    name: 'Violet Nomad #314',
    price: '1.39',
    image: '/assets/images/NFT%20Artwork%2007.png',
    availableEditions: 7,
    collection: 'Colecionáveis',
    network: 'Polygon',
    currency: 'POL',
  },
  {
    id: 'nft-08',
    name: 'Ivory Baron #088',
    price: '1.79',
    image: '/assets/images/NFT%20Artwork%2008.png',
    availableEditions: 6,
    collection: 'Generativa',
    network: 'Polygon',
    currency: 'POL',
  },
  {
    id: 'nft-09',
    name: 'Golden Beat #207',
    price: '0.99',
    image: '/assets/images/NFT%20Artwork%2009.png',
    availableEditions: 9,
    collection: 'Jogos',
    network: 'Solana',
    currency: 'SOL',
  },
  {
    id: 'nft-10',
    name: 'Golden Echo #274',
    price: '0.79',
    image: '/assets/images/NFT%20Artwork%2010.png',
    availableEditions: 5,
    collection: 'Assinaturas',
    network: 'Solana',
    currency: 'SOL',
  },
  {
    id: 'nft-11',
    name: 'Golden Signal #160',
    price: '0.39',
    image: '/assets/images/NFT%20Artwork%2011.png',
    availableEditions: 11,
    collection: 'Utilidade',
    network: 'Solana',
    currency: 'SOL',
  },
  {
    id: 'nft-16',
    name: 'Digital Horizon #016',
    price: '0.89',
    image: '/assets/images/NFT%20Artwork%2016.png',
    availableEditions: 8,
    collection: 'Arte digital',
    network: 'Ethereum',
    currency: 'ETH',
  },
  {
    id: 'nft-17',
    name: 'Mystic Artifact #017',
    price: '1.58',
    image: '/assets/images/NFT%20Artwork%2017.png',
    availableEditions: 6,
    collection: 'Arte 3D',
    network: 'Polygon',
    currency: 'POL',
  },
  {
    id: 'nft-18',
    name: 'Solar Relic #018',
    price: '1.29',
    image: '/assets/images/NFT%20Artwork%2018.png',
    availableEditions: 7,
    collection: 'Jogos',
    network: 'Solana',
    currency: 'SOL',
  },
]

const NFT_UPDATES_KEY = 'kurio:mock:nft-updates:v1'

type StoredNftUpdate = {
  version: number
  price?: string
  oldPrice?: string | null
  availableEditions?: number
  editions?: Record<string, number>
  updatedAt: string
}

type StoredNftUpdates = Record<string, StoredNftUpdate>

function readStoredUpdates(): StoredNftUpdates {
  try {
    const value = window.localStorage.getItem(NFT_UPDATES_KEY)
    return value ? (JSON.parse(value) as StoredNftUpdates) : {}
  } catch {
    return {}
  }
}

function persistUpdates(updates: StoredNftUpdates) {
  window.localStorage.setItem(NFT_UPDATES_KEY, JSON.stringify(updates))
}

function findNft(nftId: string) {
  return nfts.find((candidate) => candidate.id === nftId)
}

// Rehidrata os deltas persistidos para que REST e eventos permaneçam
// coerentes após recarregar a página.
for (const [nftId, update] of Object.entries(readStoredUpdates())) {
  const nft = findNft(nftId)
  if (!nft) continue
  if (update.price !== undefined) nft.price = update.price
  if (update.oldPrice !== undefined) nft.oldPrice = update.oldPrice ?? undefined
  if (update.availableEditions !== undefined) {
    nft.availableEditions = update.availableEditions
  }
  for (const [editionId, quantity] of Object.entries(update.editions ?? {})) {
    const edition = nft.editions?.find((candidate) => candidate.id === editionId)
    if (edition) edition.availableQuantity = quantity
  }
  nft.version = update.version
  nft.updatedAt = update.updatedAt
}

for (const nft of nfts) {
  nft.version ??= 1
}

export type NftUpdatedPayload = {
  /** Identidade estável do recurso afetado. */
  id: string
  nftId: string
  /** Versão monotônica usada para descartar duplicatas e eventos antigos. */
  version: number
  price?: string
  oldPrice?: string | null
  currency?: string
  availableEditions?: number
  editions?: NftEdition[]
  updatedAt: string
}

function buildNftUpdatedPayload(nft: Nft): NftUpdatedPayload {
  return {
    id: nft.id,
    nftId: nft.id,
    version: nft.version ?? 1,
    price: nft.price,
    oldPrice: nft.oldPrice ?? null,
    currency: nft.currency,
    availableEditions: nft.availableEditions,
    editions: nft.editions?.map((edition) => ({ ...edition })),
    updatedAt: nft.updatedAt ?? new Date().toISOString(),
  }
}

type NftChanges = {
  price?: string
  oldPrice?: string | null
  editionQuantities?: Record<string, number>
}

function applyNftUpdate(nftId: string, changes: NftChanges): NftUpdatedPayload | null {
  const nft = findNft(nftId)
  if (!nft) return null

  const version = (nft.version ?? 0) + 1
  const updatedAt = new Date().toISOString()

  if (changes.price !== undefined) nft.price = changes.price
  if (changes.oldPrice !== undefined) nft.oldPrice = changes.oldPrice ?? undefined
  if (changes.editionQuantities) {
    for (const [editionId, quantity] of Object.entries(changes.editionQuantities)) {
      const edition = nft.editions?.find((candidate) => candidate.id === editionId)
      if (edition) edition.availableQuantity = quantity
    }
    if (nft.editions) {
      nft.availableEditions = nft.editions.reduce(
        (total, edition) => total + edition.availableQuantity,
        0,
      )
    }
  }

  nft.version = version
  nft.updatedAt = updatedAt

  const updates = readStoredUpdates()
  updates[nftId] = {
    version,
    price: nft.price,
    oldPrice: nft.oldPrice ?? null,
    availableEditions: nft.availableEditions,
    editions: Object.fromEntries(
      (nft.editions ?? []).map((edition) => [edition.id, edition.availableQuantity]),
    ),
    updatedAt,
  }
  persistUpdates(updates)

  const payload = buildNftUpdatedPayload(nft)
  broadcastNftUpdated(payload)
  return payload
}

export function updateNftPrice(nftId: string, price: string, oldPrice?: string) {
  return applyNftUpdate(nftId, { price, oldPrice })
}

export function updateNftEditionStock(
  nftId: string,
  editionId: string,
  availableQuantity: number,
) {
  return applyNftUpdate(nftId, { editionQuantities: { [editionId]: availableQuantity } })
}

/**
 * Reemite o estado atual (ou um payload forçado) sem alterar os dados.
 * Usado pelos cenários determinísticos de evento duplicado e antigo.
 */
export function emitNftUpdatedEvent(
  nftId: string,
  override?: Partial<Omit<NftUpdatedPayload, 'id' | 'nftId'>>,
) {
  const nft = findNft(nftId)
  if (!nft) return null

  const payload = { ...buildNftUpdatedPayload(nft), ...override }
  broadcastNftUpdated(payload)
  return payload
}
