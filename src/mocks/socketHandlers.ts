import { ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import {
  registerMockSocket,
  setMockSocketUser,
  unregisterMockSocket,
} from './socketBus'

type MockSession = { accessToken: string; userId: string; expiresAt: number }

const SESSIONS_KEY = 'kurio:mock:sessions:v1'

function resolveUserId(accessToken: string | null | undefined) {
  if (!accessToken) return null
  try {
    const sessions = JSON.parse(
      window.localStorage.getItem(SESSIONS_KEY) ?? '[]',
    ) as MockSession[]
    const session = sessions.find((item) => item.accessToken === accessToken)
    return session && session.expiresAt > Date.now() ? session.userId : null
  } catch {
    return null
  }
}

/**
 * Transporte simulado do Socket.IO: o cliente conecta em `/socket.io` no
 * WebSocket do próprio servidor de desenvolvimento e o MSW intercepta a
 * conexão, completando o handshake Engine.IO/Socket.IO via
 * `@mswjs/socket.io-binding`.
 */
const socketLink = ws.link('/')

export const socketHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)
    const entry = registerMockSocket((event, ...data) => {
      io.client.emit(event, ...data)
    })

    // Mantém a sessão Engine.IO viva respondendo aos pings do cliente.
    connection.client.addEventListener('message', (event) => {
      if (event.data === '2') connection.client.send('3')
    })

    io.client.on('session.authenticate', (_event, payload?: { token?: string | null }) => {
      setMockSocketUser(entry, resolveUserId(payload?.token ?? null))
    })

    connection.client.addEventListener('close', () => {
      unregisterMockSocket(entry)
    })
  }),
]
