import { createContext } from 'react'
import type { AuthMode } from '@/components/auth/AuthDialog'
import type { SessionUser } from '@/services/session'

export type AuthContextValue = {
  user: SessionUser | null
  isLoading: boolean
  openAuth: (mode?: AuthMode) => void
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
