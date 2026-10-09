import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'

const queryClient = new QueryClient()

async function bootstrap() {
  // Os módulos do aplicativo são importados apenas depois de o worker do MSW
  // estar ativo: `engine.io-client` captura `globalThis.WebSocket` na
  // avaliação do módulo, e a conexão do `socket.io-client` precisa nascer já
  // interceptada pelo transporte simulado.
  if (import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('./mocks/browser')

    await worker.start({
      onUnhandledFrame: 'bypass',
    })
  }

  const [{ router }, { AuthProvider }, { RealtimeSync }] = await Promise.all([
    import('./router'),
    import('./components/auth/AuthProvider'),
    import('./realtime/RealtimeSync'),
  ])

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RealtimeSync />
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}

void bootstrap()
