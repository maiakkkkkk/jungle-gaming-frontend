import { queryOptions } from '@tanstack/react-query'
import { api } from '@/lib/api'

export type SessionUser = {
  id: string
  username: string
  displayName: string
  email: string
}

export type Session = {
  user: SessionUser
  expiresAt: string
}

export type AuthResponse = {
  accessToken: string
  session: Session
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  username: string
  email: string
  password: string
}

export type AccountResponse = {
  id: string
  username: string
  displayName: string
  email: string
}

export type ApiErrorResponse = {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

export const sessionQueryKey = ['session'] as const

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKey,
    queryFn: getSession,
    retry: false,
    staleTime: 30_000,
  })
}

export async function getSession(): Promise<Session | null> {
  const response = await api.get<Session | null>('/session')
  return response.data
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/session', input)
  return response.data
}

export async function registerAccount(
  input: RegisterInput,
): Promise<AccountResponse> {
  const response = await api.post<AccountResponse>('/accounts', input)
  return response.data
}

export async function logout(): Promise<void> {
  await api.delete('/session')
}
