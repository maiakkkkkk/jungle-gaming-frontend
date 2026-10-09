
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router'
import App from './App'
import NftDetails from './pages/NftDetails'
import CartPage from './pages/Cart'
import PaymentPage from './pages/Payment'
import ProfilePage from './pages/Profile'
import WalletsPage from './pages/Wallets'
import OrderConfirmationPage from './pages/OrderConfirmation'

export type CatalogSearch = {
  q?: string
  view?: 'new' | 'trending'
  collection?: string
  network?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'recent' | 'price-asc' | 'price-desc'
  page?: number
}

function parseText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim()
    ? value
    : undefined
}

function parseNumber(value: unknown): number | undefined {
  const parsed =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : undefined
}

function parsePage(value: unknown): number | undefined {
  const parsed = parseNumber(value)

  return parsed !== undefined &&
    Number.isInteger(parsed) &&
    parsed >= 1
    ? parsed
    : undefined
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
  validateSearch: (search: Record<string, unknown>): CatalogSearch => {
    const sort = search.sort
    const view = search.view

    return {
      q: parseText(search.q),
      view:
        view === 'new' || view === 'trending'
          ? view
          : undefined,
      collection: parseText(search.collection),
      network: parseText(search.network),
      minPrice: parseNumber(search.minPrice),
      maxPrice: parseNumber(search.maxPrice),
      sort:
        sort === 'recent' ||
        sort === 'price-asc' ||
        sort === 'price-desc'
          ? sort
          : undefined,
      page: parsePage(search.page),
    }
  },
})

const nftDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nft/$nftId',
  component: NftDetails,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: PaymentPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const walletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wallets',
  component: WalletsPage,
})
const orderRoute = createRoute({ getParentRoute: () => rootRoute, path: '/order/$orderId', component: OrderConfirmationPage })

const routeTree = rootRoute.addChildren([
  homeRoute,
  nftDetailsRoute,
  cartRoute,
  paymentRoute,
  profileRoute,
  walletsRoute,
  orderRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
