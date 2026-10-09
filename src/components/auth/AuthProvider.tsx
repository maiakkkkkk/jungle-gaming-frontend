import { useEffect, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AuthDialog, { type AuthMode } from '@/components/auth/AuthDialog'
import { AuthContext } from '@/components/auth/authContext'
import { clearAccessToken, SESSION_EXPIRED_EVENT, setAccessToken } from '@/lib/sessionToken'
import {
  logout as endSession,
  sessionQueryKey,
  sessionQueryOptions,
  type AuthResponse,
} from '@/services/session'

function clearSessionCache(queryClient: ReturnType<typeof useQueryClient>) {
  clearAccessToken()
  queryClient.removeQueries({
    predicate: (query) => query.meta?.private === true,
  })
  queryClient.setQueryData(sessionQueryKey, null)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery(sessionQueryOptions())
  const [authMode, setAuthMode] = useState<AuthMode | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const logoutMutation = useMutation({ mutationFn: endSession })

  useEffect(() => {
    const handleSessionExpired = () => {
      clearSessionCache(queryClient)
      setNotice('Sua sessão expirou. Entre novamente para continuar.')
      setAuthMode('login')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)

    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }
  }, [queryClient])

  function openAuth(mode: AuthMode = 'login') {
    setNotice(null)
    setAuthMode(mode)
  }

  function authenticate(response: AuthResponse) {
    clearSessionCache(queryClient)
    setAccessToken(response.accessToken)
    queryClient.setQueryData(sessionQueryKey, response.session)
    setAuthMode(null)
    setNotice(null)
  }

  async function logout() {
    try {
      await logoutMutation.mutateAsync()
    } catch {
      // Clear the local session even when the mock endpoint is unavailable.
    } finally {
      clearSessionCache(queryClient)
    }
  }

  const user = sessionQuery.data?.user ?? null

  return (
    <AuthContext.Provider
      value={{ user, isLoading: sessionQuery.isPending, openAuth, logout }}
    >
      {children}
      {authMode && (
        <AuthDialog
          mode={authMode}
          notice={notice}
          onClose={() => setAuthMode(null)}
          onModeChange={(mode) => {
            setNotice(null)
            setAuthMode(mode)
          }}
          onAuthenticated={authenticate}
          onRegistered={() => {
            setNotice('Cadastro concluído. Entre com os dados da sua conta.')
            setAuthMode('login')
          }}
        />
      )}
    </AuthContext.Provider>
  )
}
