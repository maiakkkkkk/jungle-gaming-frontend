import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/useAuth'
import { cartQueryKey, cartQuoteQueryKey } from '@/hooks/useMarketplace'
import { createOrder, getOrder, type CreateOrderInput } from '@/services/marketplace'

export const orderQueryKey = (userId: string, id: string) => ['order', userId, id] as const

export function useOrder(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: user && id ? orderQueryKey(user.id, id) : ['order', 'guest', id],
    queryFn: ({ signal }) => getOrder(id!, signal),
    enabled: Boolean(user && id),
    meta: { private: true },
    retry: false,
  })
}

export function useCreateOrder() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: (order) => {
      if (!user) return
      queryClient.setQueryData(orderQueryKey(user.id, order.id), order)
      queryClient.invalidateQueries({ queryKey: cartQueryKey(user.id) })
      queryClient.invalidateQueries({ queryKey: cartQuoteQueryKey(user.id) })
    },
  })
}
