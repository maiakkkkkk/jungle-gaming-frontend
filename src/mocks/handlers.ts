import { http, HttpResponse } from 'msw'
import type { Nft } from '@/services/nfts'
import type {
  Cart,
  CartItem,
  CartQuote,
  CartQuoteLine,
  CurrencyQuote,
  FavoriteList,
  Order,
} from '@/services/marketplace'
import { authHandlers } from './authHandlers'

const PAGE_SIZE = 9

const nfts: Nft[] = [
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

type MockSession = { accessToken: string; userId: string; expiresAt: number }
type StoredLists = Record<string, string[]>
type StoredCarts = Record<string, Cart | CartItem[]>

const FAVORITES_KEY = 'kurio:mock:favorites:v1'
const CARTS_KEY = 'kurio:mock:carts:v1'
const SESSIONS_KEY = 'kurio:mock:sessions:v1'
const ORDERS_KEY = 'kurio:mock:orders:v1'
const IDEMPOTENCY_KEY = 'kurio:mock:order-idempotency:v1'

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function currentUserId(request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const session = readStorage<MockSession[]>(SESSIONS_KEY, []).find(
    (item) => item.accessToken === token,
  )
  return session && session.expiresAt > Date.now() ? session.userId : null
}

function hasBearerToken(request: Request) {
  return Boolean(request.headers.get('Authorization')?.match(/^Bearer\s+\S+/i))
}

function unauthorized() {
  return HttpResponse.json(
    { code: 'SESSION_EXPIRED', message: 'Entre para continuar.' },
    { status: 401 },
  )
}

function cartFor(ownerId: string) {
  const stored = readStorage<StoredCarts>(CARTS_KEY, {})[ownerId]
  return Array.isArray(stored) ? { items: stored } : stored ?? { items: [] }
}

function saveCart(ownerId: string, cart: Cart) {
  const carts = readStorage<StoredCarts>(CARTS_KEY, {})
  carts[ownerId] = cart
  window.localStorage.setItem(CARTS_KEY, JSON.stringify(carts))
  return cart
}

function mergeGuestCart(userId: string) {
  const carts = readStorage<StoredCarts>(CARTS_KEY, {})
  const guest = carts.guest
  const guestCart = Array.isArray(guest) ? { items: guest } : guest ?? { items: [] }
  const userCart = cartFor(userId)
  if (!guestCart.items.length && !guestCart.couponCode) return userCart

  for (const guestItem of guestCart.items) {
    const existing = userCart.items.find(
      (item) => item.nftId === guestItem.nftId && item.editionId === guestItem.editionId,
    )
    if (existing) {
      existing.quantity += guestItem.quantity
    } else {
      userCart.items.push(guestItem)
    }
  }
  userCart.couponCode ??= guestCart.couponCode
  carts[userId] = userCart
  carts.guest = { items: [] }
  window.localStorage.setItem(CARTS_KEY, JSON.stringify(carts))
  return userCart
}

function itemAvailability(item: Pick<CartItem, 'nftId' | 'editionId'>) {
  const nft = nfts.find((candidate) => candidate.id === item.nftId)
  const edition = nft?.editions?.find((candidate) => candidate.id === item.editionId)
  return edition?.availableQuantity ?? 0
}

const coupons = {
  KURIO10: { discountBps: 1000 },
} as const
const expiredCoupons = new Set(['EXPIRADO10'])
const networkFees: Record<string, string> = { ETH: '0.016' }
const DECIMAL_SCALE = 10n ** 18n

function parseDecimalAmount(value: string) {
  const [whole = '0', fraction = ''] = value.split('.')
  return BigInt(whole) * DECIMAL_SCALE + BigInt(fraction.padEnd(18, '0').slice(0, 18))
}

function formatDecimalAmount(value: bigint) {
  const whole = value / DECIMAL_SCALE
  const fraction = (value % DECIMAL_SCALE)
    .toString()
    .padStart(18, '0')
    .replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : String(whole)
}

function quoteCart(cart: Cart): CartQuote {
  const discountBps = cart.couponCode
    ? coupons[cart.couponCode as keyof typeof coupons]?.discountBps ?? 0
    : 0
  const lines: CartQuoteLine[] = cart.items.map((item) => {
    const nft = nfts.find((candidate) => candidate.id === item.nftId)
    const edition = nft?.editions?.find((candidate) => candidate.id === item.editionId)
    const availableQuantity = edition?.availableQuantity
    const status: CartQuoteLine['status'] =
      !nft || !edition
        ? 'unavailable'
        : item.quantity > edition.availableQuantity
          ? 'insufficient-stock'
          : 'available'
    const lineTotal =
      status === 'available' && nft
        ? formatDecimalAmount(parseDecimalAmount(nft.price) * BigInt(item.quantity))
        : undefined

    return {
      id: item.id,
      nftId: item.nftId,
      name: nft?.name ?? 'NFT indisponível',
      image: nft?.image,
      editionLabel: edition?.label ?? item.editionLabel,
      quantity: item.quantity,
      currency: nft?.currency,
      unitPrice: nft?.price,
      lineTotal,
      availableQuantity,
      status,
    }
  })

  const eligibleByCurrency = new Map<string, bigint>()
  for (const line of lines) {
    if (line.status !== 'available' || !line.currency || !line.lineTotal) continue
    eligibleByCurrency.set(
      line.currency,
      (eligibleByCurrency.get(line.currency) ?? 0n) + parseDecimalAmount(line.lineTotal),
    )
  }

  const totals: CurrencyQuote[] = [...eligibleByCurrency].map(([currency, subtotal]) => {
    const discount = (subtotal * BigInt(discountBps)) / 10_000n
    const networkFee = networkFees[currency]
    return {
      currency,
      subtotal: formatDecimalAmount(subtotal),
      discount: formatDecimalAmount(discount),
      networkFee: networkFee ?? null,
      total:
        networkFee === undefined
          ? null
          : formatDecimalAmount(
              subtotal - discount + parseDecimalAmount(networkFee),
            ),
    }
  })

  return {
    lines,
    totals,
    couponCode: cart.couponCode,
    couponDiscountBps: discountBps,
  }
}

type StoredOrders = Record<string, Order>
type StoredIdempotency = Record<string, { orderId: string; fingerprint: string }>

function orderError(code: string, message: string, status: number) {
  return HttpResponse.json({ code, message }, { status })
}

export const handlers = [
  ...authHandlers,
  http.get('/api/favorites', ({ request }) => {
    const userId = currentUserId(request)
    if (!userId) return unauthorized()
    const favorites = readStorage<StoredLists>(FAVORITES_KEY, {})
    return HttpResponse.json({ nftIds: favorites[userId] ?? [] } satisfies FavoriteList)
  }),
  http.put('/api/favorites/:nftId', ({ request, params }) => {
    const userId = currentUserId(request)
    if (!userId) return unauthorized()
    const nftId = String(params.nftId)
    if (!nfts.some((nft) => nft.id === nftId)) {
      return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 })
    }
    const favorites = readStorage<StoredLists>(FAVORITES_KEY, {})
    favorites[userId] = [...new Set([...(favorites[userId] ?? []), nftId])]
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    return HttpResponse.json({ nftIds: favorites[userId] } satisfies FavoriteList)
  }),
  http.delete('/api/favorites/:nftId', ({ request, params }) => {
    const userId = currentUserId(request)
    if (!userId) return unauthorized()
    const favorites = readStorage<StoredLists>(FAVORITES_KEY, {})
    favorites[userId] = (favorites[userId] ?? []).filter(
      (nftId) => nftId !== String(params.nftId),
    )
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    return HttpResponse.json({ nftIds: favorites[userId] } satisfies FavoriteList)
  }),
  http.get('/api/cart', ({ request }) => {
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    return HttpResponse.json(userId ? mergeGuestCart(userId) : cartFor(ownerId))
  }),
  http.get('/api/cart/quote', ({ request }) => {
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    return HttpResponse.json(quoteCart(cart))
  }),
  http.post('/api/cart/items', async ({ request }) => {
    const body = (await request.json()) as Partial<CartItem>
    const nftId = body.nftId
    const editionId = body.editionId
    const quantity = body.quantity
    if (
      typeof nftId !== 'string' ||
      typeof editionId !== 'string' ||
      !Number.isInteger(quantity) ||
      (quantity ?? 0) < 1
    ) {
      return HttpResponse.json({ message: 'Item inválido.' }, { status: 422 })
    }
    const availability = itemAvailability({ nftId, editionId })
    if (availability < 1) {
      return HttpResponse.json(
        { code: 'EDITION_UNAVAILABLE', message: 'Esta edição não está disponível.' },
        { status: 409 },
      )
    }
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    const existing = cart.items.find(
      (item) => item.nftId === nftId && item.editionId === editionId,
    )
    const newQuantity = (existing?.quantity ?? 0) + quantity!
    if (newQuantity > availability) {
      return HttpResponse.json(
        { code: 'INSUFFICIENT_STOCK', message: 'Quantidade maior que o estoque disponível.' },
        { status: 409 },
      )
    }
    if (existing) existing.quantity = newQuantity
    else {
      const nft = nfts.find((candidate) => candidate.id === nftId)!
      const edition = nft.editions!.find((candidate) => candidate.id === editionId)!
      cart.items.push({
        id: `${nftId}:${editionId}`,
        nftId,
        editionId,
        editionLabel: edition.label,
        quantity: quantity!,
      })
    }
    return HttpResponse.json(saveCart(ownerId, cart))
  }),
  http.patch('/api/cart/items/:itemId', async ({ request, params }) => {
    const body = (await request.json()) as { quantity?: number }
    const quantity = body.quantity
    if (!Number.isInteger(quantity) || (quantity ?? 0) < 1) {
      return HttpResponse.json(
        { code: 'INVALID_QUANTITY', message: 'A quantidade precisa ser um inteiro maior que zero.' },
        { status: 422 },
      )
    }
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    const item = cart.items.find((candidate) => candidate.id === String(params.itemId))
    if (!item) {
      return HttpResponse.json({ message: 'Item não encontrado.' }, { status: 404 })
    }
    const available = itemAvailability(item)
    if (available < 1 || quantity! > available) {
      return HttpResponse.json(
        {
          code: available < 1 ? 'EDITION_UNAVAILABLE' : 'INSUFFICIENT_STOCK',
          message:
            available < 1
              ? 'Esta edição não está disponível.'
              : `Há somente ${available} unidade(s) disponíveis.`,
        },
        { status: 409 },
      )
    }
    item.quantity = quantity!
    return HttpResponse.json(saveCart(ownerId, cart))
  }),
  http.delete('/api/cart/items/:itemId', ({ request, params }) => {
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    const index = cart.items.findIndex((item) => item.id === String(params.itemId))
    if (index < 0) {
      return HttpResponse.json({ message: 'Item não encontrado.' }, { status: 404 })
    }
    cart.items.splice(index, 1)
    return HttpResponse.json(saveCart(ownerId, cart))
  }),
  http.put('/api/cart/coupon', async ({ request }) => {
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const body = (await request.json()) as { code?: string }
    const code = body.code?.trim().toUpperCase() ?? ''
    if (expiredCoupons.has(code)) {
      return HttpResponse.json(
        { code: 'COUPON_EXPIRED', message: 'Esse cupom de teste expirou.' },
        { status: 410 },
      )
    }
    if (!Object.prototype.hasOwnProperty.call(coupons, code)) {
      return HttpResponse.json(
        { code: 'COUPON_INVALID', message: 'Cupom inválido. Confira o código e tente novamente.' },
        { status: 422 },
      )
    }
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    cart.couponCode = code
    return HttpResponse.json(saveCart(ownerId, cart))
  }),
  http.delete('/api/cart/coupon', ({ request }) => {
    const userId = currentUserId(request)
    if (hasBearerToken(request) && !userId) return unauthorized()
    const ownerId = userId ?? 'guest'
    const cart = userId ? mergeGuestCart(userId) : cartFor(ownerId)
    delete cart.couponCode
    return HttpResponse.json(saveCart(ownerId, cart))
  }),
  http.post('/api/orders', async ({ request }) => {
    const userId = currentUserId(request)
    if (!userId) return unauthorized()
    const body = (await request.json()) as {
      idempotencyKey?: string
      wallet?: { label?: string; address?: string; network?: string; provider?: string }
    }
    const idempotencyKey = request.headers.get('Idempotency-Key') ?? body.idempotencyKey ?? ''
    if (!idempotencyKey || !body.wallet?.address || !body.wallet.network || !body.wallet.provider) {
      return orderError('ORDER_VALIDATION_ERROR', 'Selecione uma carteira e um provedor para continuar.', 422)
    }
    const wallet = {
      label: body.wallet.label?.trim() || 'Carteira selecionada',
      address: body.wallet.address.trim(),
      network: body.wallet.network.trim(),
      provider: body.wallet.provider.trim(),
    }
    const cart = mergeGuestCart(userId)
    const quote = quoteCart(cart)
    const fingerprint = JSON.stringify({ cart, wallet })
    const idempotency = readStorage<StoredIdempotency>(IDEMPOTENCY_KEY, {})
    const scopedKey = `${userId}:${idempotencyKey}`
    const previous = idempotency[scopedKey]
    if (previous) {
      if (previous.fingerprint !== fingerprint) return orderError('IDEMPOTENCY_CONFLICT', 'Esta tentativa já foi usada com dados diferentes.', 409)
      const order = readStorage<StoredOrders>(ORDERS_KEY, {})[previous.orderId]
      if (order) return HttpResponse.json(order)
    }
    if (!cart.items.length) return orderError('CART_EMPTY', 'Seu carrinho está vazio.', 422)
    if (quote.lines.some((line) => line.status !== 'available') || quote.totals.some((total) => !total.total)) {
      return orderError('QUOTE_OUTDATED', 'O carrinho mudou. Revise disponibilidade e valores antes de confirmar.', 409)
    }
    const incompatible = quote.lines.some((line) => {
      const nft = nfts.find((candidate) => candidate.id === line.nftId)
      return nft?.network !== wallet.network
    })
    if (incompatible) return orderError('NETWORK_MISMATCH', 'A rede da carteira não corresponde aos NFTs do pedido.', 422)
    const order: Order = {
      id: `ord_${crypto.randomUUID()}`,
      status: wallet.provider === 'Recusar pagamento' ? 'declined' : 'confirmed',
      createdAt: new Date().toISOString(),
      wallet,
      lines: quote.lines,
      totals: quote.totals,
      couponCode: quote.couponCode,
      transactionId: `0x${crypto.randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase()}`,
      declineReason: wallet.provider === 'Recusar pagamento' ? 'A simulação de pagamento foi recusada pelo provedor.' : undefined,
    }
    const orders = readStorage<StoredOrders>(ORDERS_KEY, {})
    orders[order.id] = order
    idempotency[scopedKey] = { orderId: order.id, fingerprint }
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
    window.localStorage.setItem(IDEMPOTENCY_KEY, JSON.stringify(idempotency))
    if (order.status === 'confirmed') {
      for (const line of quote.lines) {
        const nft = nfts.find((candidate) => candidate.id === line.nftId)
        const edition = nft?.editions?.find((candidate) => candidate.id === cart.items.find((item) => item.id === line.id)?.editionId)
        if (edition) edition.availableQuantity -= line.quantity
      }
      saveCart(userId, { items: [] })
    }
    return HttpResponse.json(order, { status: 201 })
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    const userId = currentUserId(request)
    if (!userId) return unauthorized()
    const order = readStorage<StoredOrders>(ORDERS_KEY, {})[String(params.id)]
    if (!order) return orderError('ORDER_NOT_FOUND', 'Pedido não encontrado.', 404)
    const idempotency = readStorage<StoredIdempotency>(IDEMPOTENCY_KEY, {})
    if (!Object.entries(idempotency).some(([key, value]) => key.startsWith(`${userId}:`) && value.orderId === order.id)) {
      return orderError('ORDER_NOT_FOUND', 'Pedido não encontrado.', 404)
    }
    return HttpResponse.json(order)
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = nfts.find((item) => item.id === String(params.id))

    if (!nft) {
      return HttpResponse.json(
        { message: 'NFT não encontrado.' },
        { status: 404 },
      )
    }

    return HttpResponse.json(nft)
  }),

  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)

    const query =
      url.searchParams.get('q')?.trim().toLowerCase() ?? ''
    const view = url.searchParams.get('view')
    const collection = url.searchParams.get('collection')
    const network = url.searchParams.get('network')
    const minValue = url.searchParams.get('minPrice')
    const maxValue = url.searchParams.get('maxPrice')
    const sort = url.searchParams.get('sort')

    const parsedPage = Number(url.searchParams.get('page') ?? '1')
    const requestedPage =
      Number.isInteger(parsedPage) && parsedPage >= 1
        ? parsedPage
        : 1

    const minPrice =
      network &&
      minValue !== null &&
      minValue.trim() !== '' &&
      Number.isFinite(Number(minValue))
        ? Number(minValue)
        : undefined

    const maxPrice =
      network &&
      maxValue !== null &&
      maxValue.trim() !== '' &&
      Number.isFinite(Number(maxValue))
        ? Number(maxValue)
        : undefined

    const availableNfts =
      view === 'new' || view === 'trending' ? [] : nfts

    const filteredNfts = availableNfts.filter((nft) => {
      const price = Number(nft.price)

      const matchesQuery =
        !query ||
        `${nft.name} ${nft.collection} ${nft.network}`
          .toLowerCase()
          .includes(query)

      const matchesCollection =
        !collection || nft.collection === collection
      const matchesNetwork = !network || nft.network === network
      const matchesMinPrice =
        minPrice === undefined || price >= minPrice
      const matchesMaxPrice =
        maxPrice === undefined || price <= maxPrice

      return (
        matchesQuery &&
        matchesCollection &&
        matchesNetwork &&
        matchesMinPrice &&
        matchesMaxPrice
      )
    })

    if (network && sort === 'price-asc') {
      filteredNfts.sort(
        (a, b) => Number(a.price) - Number(b.price),
      )
    } else if (network && sort === 'price-desc') {
      filteredNfts.sort(
        (a, b) => Number(b.price) - Number(a.price),
      )
    }

    const total = filteredNfts.length
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const page = Math.min(requestedPage, totalPages)
    const start = (page - 1) * PAGE_SIZE

    return HttpResponse.json({
      items: filteredNfts.slice(start, start + PAGE_SIZE),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages,
    })
  }),
]
