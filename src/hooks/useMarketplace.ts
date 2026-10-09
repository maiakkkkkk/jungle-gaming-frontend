import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/components/auth/useAuth'
import {
  addCartItem,
  applyCartCoupon,
  addFavorite,
  getCart,
  getCartQuote,
  getFavorites,
  removeCartCoupon,
  removeCartItem,
  removeFavorite,
  updateCartItem,
  type Cart,
  type CartItem,
} from '@/services/marketplace'

export const cartQueryKey = (userId?: string) =>
  ['cart', userId ?? 'guest'] as const
export const cartQuoteQueryKey = (userId?: string) =>
  ['cartQuote', userId ?? 'guest'] as const
export const favoritesQueryKey = (userId: string) =>
  ['favorites', userId] as const

export function useCart() {
  const { user } = useAuth()

  return useQuery({
    queryKey: cartQueryKey(user?.id),
    queryFn: ({ signal }) => getCart(signal),
    meta: user ? { private: true } : undefined,
  })
}

export function useCartQuote() {
  const { user } = useAuth()

  return useQuery({
    queryKey: cartQuoteQueryKey(user?.id),
    queryFn: ({ signal }) => getCartQuote(signal),
    meta: user ? { private: true } : undefined,
    refetchInterval: 15_000,
  })
}

export function useFavorite(nftId: string) {
  const { user, openAuth } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = user ? favoritesQueryKey(user.id) : ['favorites', 'guest']
  const favoritesQuery = useQuery({
    queryKey,
    queryFn: ({ signal }) => getFavorites(signal),
    enabled: Boolean(user),
    meta: { private: true },
  })
  const favoriteMutation = useMutation({
    mutationFn: (isFavorite: boolean) =>
      isFavorite ? removeFavorite(nftId) : addFavorite(nftId),
    onSuccess: (favorites) => {
      queryClient.setQueryData(queryKey, favorites)
    },
  })

  return {
    isFavorite: favoritesQuery.data?.nftIds.includes(nftId) ?? false,
    isPending: Boolean(user) && (favoritesQuery.isPending || favoriteMutation.isPending),
    hasError: favoriteMutation.isError,
    toggle: () => {
      if (!user) {
        openAuth('login')
        return
      }
      favoriteMutation.mutate(
        favoritesQuery.data?.nftIds.includes(nftId) ?? false,
      )
    },
  }
}

export function useAddCartItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: Omit<CartItem, 'id'>) => addCartItem(item),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey(user?.id), cart)
      void queryClient.invalidateQueries({
        queryKey: cartQuoteQueryKey(user?.id),
      })
    },
  })
}

export function useUpdateCartItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = cartQueryKey(user?.id)

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItem(itemId, { quantity }),
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Cart>(key)
      if (previous) {
        queryClient.setQueryData<Cart>(key, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        })
      }
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      void queryClient.invalidateQueries({
        queryKey: cartQuoteQueryKey(user?.id),
      })
    },
  })
}

export function useRemoveCartItem() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = cartQueryKey(user?.id)

  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Cart>(key)
      if (previous) {
        queryClient.setQueryData<Cart>(key, {
          ...previous,
          items: previous.items.filter((item) => item.id !== itemId),
        })
      }
      return { previous }
    },
    onError: (_error, _itemId, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSuccess: (cart) => queryClient.setQueryData(key, cart),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: key })
      void queryClient.invalidateQueries({
        queryKey: cartQuoteQueryKey(user?.id),
      })
    },
  })
}

export function useCartCoupon() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const key = cartQueryKey(user?.id)
  const refreshQuote = () =>
    queryClient.invalidateQueries({
      queryKey: cartQuoteQueryKey(user?.id),
    })

  const apply = useMutation({
    mutationFn: (code: string) => applyCartCoupon(code),
    onSuccess: (cart) => {
      queryClient.setQueryData(key, cart)
      void refreshQuote()
    },
  })
  const remove = useMutation({
    mutationFn: removeCartCoupon,
    onSuccess: (cart) => {
      queryClient.setQueryData(key, cart)
      void refreshQuote()
    },
  })

  return { apply, remove }
}
