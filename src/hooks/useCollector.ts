import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/useAuth'
import { sessionQueryKey, type Session } from '@/services/session'
import {
  changeCollectorPassword,
  collectorProfileKey,
  collectorWalletsKey,
  getCollectorProfile,
  getCollectorWallets,
  updateCollectorProfile,
  updateCollectorWallets,
  type CollectorProfile,
  type CollectorWallets,
} from '@/services/collector'

export function useCollectorProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = user ? collectorProfileKey(user.id) : ['collectorProfile', 'guest']
  const profile = useQuery({
    queryKey,
    queryFn: ({ signal }) => getCollectorProfile(signal),
    enabled: Boolean(user),
    meta: { private: true },
  })

  const update = useMutation({
    mutationFn: updateCollectorProfile,
    onSuccess: (savedProfile) => {
      queryClient.setQueryData<CollectorProfile>(queryKey, savedProfile)
      queryClient.setQueryData<Session | null>(sessionQueryKey, (session) =>
        session
          ? {
              ...session,
              user: {
                ...session.user,
                username: savedProfile.username,
                displayName: savedProfile.displayName,
                email: savedProfile.email,
              },
            }
          : session,
      )
    },
  })

  return { profile, update }
}

export function useChangeCollectorPassword() {
  return useMutation({ mutationFn: changeCollectorPassword })
}

export function useCollectorWallets() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = user ? collectorWalletsKey(user.id) : ['collectorWallets', 'guest']
  const wallets = useQuery({
    queryKey,
    queryFn: ({ signal }) => getCollectorWallets(signal),
    enabled: Boolean(user),
    meta: { private: true },
  })
  const update = useMutation({
    mutationFn: updateCollectorWallets,
    onSuccess: (savedWallets: CollectorWallets) => {
      queryClient.setQueryData(queryKey, savedWallets)
    },
  })

  return { wallets, update }
}
