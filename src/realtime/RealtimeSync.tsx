import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/useAuth'
import { getSocket } from './socketClient'
import {
  applyNftUpdatedEvent,
  applyOrderUpdatedEvent,
  reconcileActiveResources,
} from './applyRealtimeEvents'

/**
 * Mantém o ciclo de vida da conexão Socket.IO e a sincronização do cache.
 * Os listeners são liberados quando o componente desmonta ou quando a
 * identidade do usuário muda, evitando listeners órfãos entre sessões.
 */
export function RealtimeSync() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const userId = user?.id ?? null

  useEffect(() => {
    const socket = getSocket()

    const handleNftUpdated = (payload: unknown) => {
      applyNftUpdatedEvent(queryClient, payload)
    }

    const handleOrderUpdated = (payload: unknown) => {
      applyOrderUpdatedEvent(queryClient, payload, userId)
    }

    const handleConnect = () => {
      reconcileActiveResources(queryClient)
    }

    socket.on('nft.updated', handleNftUpdated)
    socket.on('order.updated', handleOrderUpdated)
    socket.on('connect', handleConnect)

    return () => {
      socket.off('nft.updated', handleNftUpdated)
      socket.off('order.updated', handleOrderUpdated)
      socket.off('connect', handleConnect)
    }
  }, [queryClient, userId])

  return null
}
