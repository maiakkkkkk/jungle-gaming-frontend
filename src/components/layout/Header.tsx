
import { Link, useRouterState } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/useAuth'
import { useCart } from '@/hooks/useMarketplace'
import { UserRound } from 'lucide-react'

function Header() {
  const { user, isLoading, openAuth, logout } = useAuth()
  const cartQuery = useCart()
  const cartCount = (cartQuery.data?.items ?? []).reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isHome = pathname === '/'
  const isMarket = pathname.startsWith('/nft')

  const navClass =
    'relative flex h-[45px] items-start text-base transition-colors'

  return (
    <header className="mx-auto w-full max-w-[1200px] px-3 pt-4 lg:px-0 lg:pt-6">
      <div className="mx-auto flex h-10 w-full max-w-[1200px] items-center justify-between lg:h-[45px] lg:items-start">
        <Link
          to="/"
          className="flex h-9 w-auto shrink-0 items-center text-sm font-bold tracking-wider text-foreground lg:w-40"
        >
          KURIO
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-start gap-10 lg:flex">
          <Link
            to="/"
            className={`${navClass} ${
              isHome
                ? 'font-bold text-text-accent'
                : 'font-normal text-foreground hover:text-text-accent'
            }`}
          >
            Início
            {isHome && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-primary" />
            )}
          </Link>

          <Link
            to="/"
            hash="mercado"
            className={`${navClass} ${
              isMarket
                ? 'font-bold text-text-accent'
                : 'font-normal text-foreground hover:text-text-accent'
            }`}
          >
            Mercado
            {isMarket && (
              <span className="absolute bottom-0 left-0 h-[3px] w-full bg-primary" />
            )}
          </Link>

          <span className={`${navClass} text-foreground`}>
            Criadores
          </span>

          <span className={`${navClass} text-foreground`}>
            Aprenda
          </span>
        </nav>

        <div className="flex shrink-0 items-center gap-3 lg:gap-7">
          <button
            type="button"
            aria-label="Buscar"
            className="flex size-5 items-center justify-center"
          >
            <img
              src="/assets/icons/Search%20Icon.svg"
              alt=""
              aria-hidden="true"
              className="size-5"
            />
          </button>

          <Link
            to="/cart"
            aria-label={`Abrir carrinho${cartCount ? `, ${cartCount} itens` : ''}`}
            className="relative flex size-6 items-center justify-center"
          >
            <img
              src="/assets/icons/Cart%20Icon.svg"
              alt=""
              aria-hidden="true"
              className="size-6"
            />

            {cartCount > 0 && (
              <Badge className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary p-0 text-[10px] font-medium text-primary-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </Badge>
            )}
          </Link>

          {user && (
            <Link
              to="/profile"
              aria-label="Perfil do colecionador"
              className="flex min-w-5 items-center gap-2 text-sm text-text-secondary hover:text-text-accent"
            >
              <UserRound className="size-5 shrink-0" aria-hidden="true" />
              <span className="hidden max-w-36 truncate xl:inline">{user.displayName}</span>
            </Link>
          )}

          <Button
            type="button"
            disabled={isLoading}
            onClick={() => (user ? void logout() : openAuth('login'))}
            aria-label={user ? 'Sair da conta' : 'Entrar na conta'}
            className="h-9 w-24 rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary-dark"
          >
            {user ? (
              'Sair'
            ) : (
              <>
                <img
                  src="/assets/icons/curved/Logout.svg"
                  alt=""
                  aria-hidden="true"
                  className="size-5"
                />
                Entrar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-primary" />
    </header>
  )
}

export default Header
