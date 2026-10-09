import { api } from '@/lib/api'

export type CollectorProfile = {
  id: string
  username: string
  displayName: string
  email: string
  ensName: string
  walletNickname: string
  avatarId: string | null
}

export type CollectorProfileInput = Omit<CollectorProfile, 'id'>

export type CollectorWallet = {
  displayName: string
  nickname: string
  network: 'Ethereum' | 'Polygon' | 'Solana'
  address: string
  type: 'software' | 'hardware' | 'custodial'
  ensName: string
}

export type CollectorWallets = {
  primary: CollectorWallet | null
  secondary: CollectorWallet | null
  secondaryUsesPrimary: boolean
}

export type CollectorWalletsInput = CollectorWallets

export type CollectorApiError = {
  code?: string
  message?: string
  fieldErrors?: Record<string, string>
}

export const collectorProfileKey = (userId: string) => ['collectorProfile', userId] as const
export const collectorWalletsKey = (userId: string) => ['collectorWallets', userId] as const

export async function getCollectorProfile(signal?: AbortSignal) {
  const response = await api.get<CollectorProfile>('/profile', { signal })
  return response.data
}

export async function updateCollectorProfile(input: CollectorProfileInput) {
  const response = await api.put<CollectorProfile>('/profile', input)
  return response.data
}

export async function changeCollectorPassword(input: {
  currentPassword: string
  newPassword: string
}) {
  const response = await api.put<{ message: string }>('/profile/password', input)
  return response.data
}

export async function getCollectorWallets(signal?: AbortSignal) {
  const response = await api.get<CollectorWallets>('/wallets', { signal })
  return response.data
}

export async function updateCollectorWallets(input: CollectorWalletsInput) {
  const response = await api.put<CollectorWallets>('/wallets', input)
  return response.data
}
