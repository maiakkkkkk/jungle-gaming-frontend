import { api } from '@/lib/api'

export type FavoriteList = { nftIds: string[] }

export type CartItem = {
  id: string
  nftId: string
  editionId: string
  editionLabel: string
  quantity: number
}

export type Cart = { items: CartItem[]; couponCode?: string }

export type CartQuoteLine = {
  id: string
  nftId: string
  name: string
  image?: string
  editionLabel: string
  quantity: number
  currency?: string
  unitPrice?: string
  lineTotal?: string
  availableQuantity?: number
  status: 'available' | 'unavailable' | 'insufficient-stock'
}

export type CurrencyQuote = {
  currency: string
  subtotal: string
  discount: string
  networkFee: string | null
  total: string | null
}

export type CartQuote = {
  lines: CartQuoteLine[]
  totals: CurrencyQuote[]
  couponCode?: string
  couponDiscountBps: number
}

export type CartCouponInput = { code: string }
export type CartQuantityInput = { quantity: number }

export type OrderStatus = 'pending' | 'confirmed' | 'declined'
export type Order = {
  id: string
  status: OrderStatus
  createdAt: string
  wallet: { label: string; address: string; network: string; provider: string }
  lines: CartQuoteLine[]
  totals: CurrencyQuote[]
  couponCode?: string
  transactionId?: string
  declineReason?: string
}
export type CreateOrderInput = {
  idempotencyKey: string
  wallet: Order['wallet']
}

export async function getFavorites(signal?: AbortSignal) {
  const response = await api.get<FavoriteList>('/favorites', { signal })
  return response.data
}

export async function addFavorite(nftId: string) {
  const response = await api.put<FavoriteList>(
    `/favorites/${encodeURIComponent(nftId)}`,
  )
  return response.data
}

export async function removeFavorite(nftId: string) {
  const response = await api.delete<FavoriteList>(
    `/favorites/${encodeURIComponent(nftId)}`,
  )
  return response.data
}

export async function getCart(signal?: AbortSignal) {
  const response = await api.get<Cart>('/cart', { signal })
  return response.data
}

export async function addCartItem(input: Omit<CartItem, 'id'>) {
  const response = await api.post<Cart>('/cart/items', input)
  return response.data
}

export async function updateCartItem(
  itemId: string,
  input: CartQuantityInput,
) {
  const response = await api.patch<Cart>(
    `/cart/items/${encodeURIComponent(itemId)}`,
    input,
  )
  return response.data
}

export async function removeCartItem(itemId: string) {
  const response = await api.delete<Cart>(
    `/cart/items/${encodeURIComponent(itemId)}`,
  )
  return response.data
}

export async function getCartQuote(signal?: AbortSignal) {
  const response = await api.get<CartQuote>('/cart/quote', { signal })
  return response.data
}

export async function applyCartCoupon(code: string) {
  const response = await api.put<Cart>('/cart/coupon', { code })
  return response.data
}

export async function removeCartCoupon() {
  const response = await api.delete<Cart>('/cart/coupon')
  return response.data
}

export async function createOrder(input: CreateOrderInput) {
  const response = await api.post<Order>('/orders', input, {
    headers: { 'Idempotency-Key': input.idempotencyKey },
  })
  return response.data
}

export async function getOrder(id: string, signal?: AbortSignal) {
  const response = await api.get<Order>(`/orders/${encodeURIComponent(id)}`, { signal })
  return response.data
}

