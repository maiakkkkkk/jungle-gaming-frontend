import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from '@/lib/sessionToken'

/**
 * Cliente Socket.IO do aplicativo. Usa apenas o transporte WebSocket (o
 * ambiente de mocks não implementa polling) e reconecta automaticamente.
 * A autenticação da sessão é (re)enviada a cada conexão — inclusive após
 * reconexões — para que o servidor associe a conexão ao usuário atual.
 */
let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: '/socket.io',
      transports: ['websocket'],
      reconnectionDelayMax: 5_000,
    })

    socket.on('connect', () => {
      socket?.emit('session.authenticate', { token: getAccessToken() })
    })
  }

  return socket
}

export function closeSocket() {
  socket?.disconnect()
  socket = null
}
