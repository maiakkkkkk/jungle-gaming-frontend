/**
 * Tentativa de pedido em andamento, persistida localmente para permitir a
 * recuperação após reconexão ou recarga sem criar outra compra: a mesma
 * chave de idempotência é reutilizada e o pedido criado é retomado.
 */
const PENDING_ORDER_KEY = 'kurio:pending-order'

export type PendingOrderAttempt = {
  /** Preenchido quando o servidor confirmou a criação do pedido. */
  orderId: string | null
  idempotencyKey: string
  userId: string
  createdAt: string
}

export function readPendingOrderAttempt(userId?: string): PendingOrderAttempt | null {
  try {
    const value = window.localStorage.getItem(PENDING_ORDER_KEY)
    if (!value) return null
    const attempt = JSON.parse(value) as PendingOrderAttempt
    if (!attempt || typeof attempt.idempotencyKey !== 'string') return null
    if (userId && attempt.userId !== userId) return null
    return attempt
  } catch {
    return null
  }
}

export function writePendingOrderAttempt(attempt: PendingOrderAttempt) {
  window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(attempt))
}

export function clearPendingOrderAttempt(orderId?: string) {
  const current = readPendingOrderAttempt()
  if (!current) return
  if (orderId && current.orderId !== orderId) return
  window.localStorage.removeItem(PENDING_ORDER_KEY)
}
