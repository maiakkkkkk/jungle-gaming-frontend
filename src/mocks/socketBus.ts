/**
 * Registro das conexões Socket.IO simuladas ativas e do usuário autenticado
 * em cada uma. `nft.updated` é um evento público de catálogo e alcança todas
 * as conexões; `order.updated` só é entregue às conexões autenticadas como o
 * dono do pedido, impedindo que eventos de uma sessão anterior afetem os dados
 * de outro usuário.
 */
export type MockSocketEmit = (event: string, ...data: unknown[]) => void

export type MockSocketEntry = {
  id: string
  emit: MockSocketEmit
  userId: string | null
}

const connections = new Set<MockSocketEntry>()

export function registerMockSocket(emit: MockSocketEmit): MockSocketEntry {
  const entry: MockSocketEntry = {
    id: crypto.randomUUID(),
    emit,
    userId: null,
  }
  connections.add(entry)
  return entry
}

export function unregisterMockSocket(entry: MockSocketEntry) {
  connections.delete(entry)
}

export function setMockSocketUser(entry: MockSocketEntry, userId: string | null) {
  entry.userId = userId
}

export function broadcastNftUpdated(payload: unknown) {
  for (const entry of [...connections]) {
    try {
      entry.emit('nft.updated', payload)
    } catch {
      unregisterMockSocket(entry)
    }
  }
}

export function broadcastOrderUpdated(payload: unknown, ownerId: string) {
  for (const entry of [...connections]) {
    if (entry.userId !== ownerId) continue
    try {
      entry.emit('order.updated', payload)
    } catch {
      unregisterMockSocket(entry)
    }
  }
}
