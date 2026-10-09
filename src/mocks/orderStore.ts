import type { Order, OrderStatus } from '@/services/marketplace'
import { broadcastOrderUpdated } from './socketBus'

/**
 * Metadados dos pedidos simulados: dono da sessão e versão monotônica do
 * recurso. Pedidos confirmados ou recusados são terminais — nenhuma
 * transição posterior é aceita, evitando regressão de estado.
 */
const ORDER_META_KEY = 'kurio:mock:order-meta:v1'

/** Criado como pendente quando este cenário estiver ativo. */
export const PAYMENT_PENDING_FLAG = 'kurio:mock:pending-payment'
/** Desliga a transição automática; a liquidação passa a ser disparada por teste. */
export const MANUAL_SETTLEMENT_FLAG = 'kurio:mock:manual-settlement'

export type OrderMeta = { ownerId: string; version: number }

type StoredOrderMeta = Record<string, OrderMeta>

function readOrderMeta(): StoredOrderMeta {
  try {
    const value = window.localStorage.getItem(ORDER_META_KEY)
    return value ? (JSON.parse(value) as StoredOrderMeta) : {}
  } catch {
    return {}
  }
}

function writeOrderMeta(meta: StoredOrderMeta) {
  window.localStorage.setItem(ORDER_META_KEY, JSON.stringify(meta))
}

export function ensureOrderMeta(orderId: string, ownerId: string): OrderMeta {
  const meta = readOrderMeta()
  const existing = meta[orderId]
  if (existing) return existing
  const created: OrderMeta = { ownerId, version: 1 }
  meta[orderId] = created
  writeOrderMeta(meta)
  return created
}

export function getOrderMeta(orderId: string): OrderMeta | null {
  return readOrderMeta()[orderId] ?? null
}

export function updateOrderMeta(
  orderId: string,
  update: (meta: OrderMeta) => OrderMeta,
): OrderMeta | null {
  const meta = readOrderMeta()
  const current = meta[orderId]
  if (!current) return null
  const next = update(current)
  meta[orderId] = next
  writeOrderMeta(meta)
  return next
}

export function isFlagEnabled(flag: string) {
  return window.localStorage.getItem(flag) === 'true'
}

export type OrderUpdatedPayload = {
  /** Identidade estável do pedido afetado. */
  id: string
  orderId: string
  ownerId: string
  /** Versão monotônica usada para descartar duplicatas e eventos antigos. */
  version: number
  status: OrderStatus
  transactionId?: string
  declineReason?: string
  updatedAt: string
}

export function buildOrderUpdatedPayload(order: Order, meta: OrderMeta): OrderUpdatedPayload {
  return {
    id: order.id,
    orderId: order.id,
    ownerId: meta.ownerId,
    version: meta.version,
    status: order.status,
    transactionId: order.transactionId,
    declineReason: order.declineReason,
    updatedAt: new Date().toISOString(),
  }
}

/** Emite `order.updated` apenas para conexões autenticadas como o dono. */
export function emitOrderUpdated(order: Order) {
  const meta = readOrderMeta()[order.id]
  if (!meta) return
  broadcastOrderUpdated(buildOrderUpdatedPayload(order, meta), meta.ownerId)
}
