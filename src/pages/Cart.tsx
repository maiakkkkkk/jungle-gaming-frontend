import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/auth/useAuth'
import {
  useCart,
  useCartCoupon,
  useCartQuote,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/useMarketplace'
import type { CartQuoteLine, CurrencyQuote } from '@/services/marketplace'
import { useQuoteStale } from '@/realtime/useRealtimeFeed'

type CartError = { code?: string; message?: string }

function errorMessage(error: unknown, fallback: string) {
  return isAxiosError<CartError>(error)
    ? error.response?.data.message ?? fallback
    : fallback
}

function CartSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando carrinho"
      className="grid animate-pulse gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-28 rounded-xl bg-surface-card" />
        ))}
      </div>
      <div className="h-[420px] rounded-xl bg-surface-card" />
    </div>
  )
}

function CartLine({
  line,
  pending,
  onQuantityChange,
  onRemove,
}: {
  line: CartQuoteLine
  pending: boolean
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const eligible = line.status === 'available'
  const canDecrease = eligible || line.status === 'insufficient-stock'

  return (
    <article className="grid min-w-0 gap-4 rounded-xl border border-border bg-surface-card p-4 lg:grid-cols-[minmax(220px,1fr)_90px_112px_104px_36px] lg:items-center lg:gap-3 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-4">
      <div className="flex min-w-0 items-center gap-4">
        {line.image ? (
          <img
            src={line.image}
            alt={line.name}
            className="size-20 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-xs text-text-secondary"
          >
            NFT
          </div>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-bold">{line.name}</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Edição: {line.editionLabel}
          </p>
          {line.status !== 'available' && (
            <p role="status" className="mt-1 text-xs text-destructive">
              {line.status === 'unavailable'
                ? 'Edição indisponível. Remova o item para continuar.'
                : `Estoque insuficiente: ${line.availableQuantity} disponível(is). Ajuste a quantidade ou remova o item.`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm lg:block">
        <span className="text-text-secondary lg:hidden">Preço</span>
        <span className="font-bold text-text-secondary">
          {line.unitPrice && line.currency
            ? `${line.unitPrice} ${line.currency}`
            : '—'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-center">
        <span className="text-sm text-text-secondary lg:hidden">Quantidade</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={`Diminuir quantidade de ${line.name}`}
            disabled={!canDecrease || line.quantity <= 1 || pending}
            onClick={() => onQuantityChange(line.quantity - 1)}
            className="flex size-8 items-center justify-center rounded-full border border-border text-lg hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <span aria-live="polite" className="min-w-4 text-center">
            {line.quantity}
          </span>
          <button
            type="button"
            aria-label={`Aumentar quantidade de ${line.name}`}
            disabled={
              !eligible ||
              line.quantity >= (line.availableQuantity ?? 0) ||
              pending
            }
            onClick={() => onQuantityChange(line.quantity + 1)}
            className="flex size-8 items-center justify-center rounded-full border border-border text-lg hover:border-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm lg:block lg:text-right">
        <span className="text-text-secondary lg:hidden">Total</span>
        <span className="font-bold text-text-accent">
          {line.lineTotal && line.currency
            ? `${line.lineTotal} ${line.currency}`
            : '—'}
        </span>
      </div>

      <button
        type="button"
        aria-label={`Remover ${line.name} do carrinho`}
        disabled={pending}
        onClick={onRemove}
        className="justify-self-end rounded p-2 text-text-secondary transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 lg:justify-self-center"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </article>
  )
}

function CartSummary({
  onContinue,
  canContinue,
  isAuthenticated,
  currencyQuotes,
  couponCode,
  couponInput,
  onCouponInput,
  onApplyCoupon,
  onRemoveCoupon,
  couponPending,
  couponError,
  actionError,
  quoteError,
  onRefreshQuote,
}: {
  onContinue: () => void
  canContinue: boolean
  isAuthenticated: boolean
  currencyQuotes: CurrencyQuote[]
  couponCode?: string
  couponInput: string
  onCouponInput: (value: string) => void
  onApplyCoupon: (event: FormEvent<HTMLFormElement>) => void
  onRemoveCoupon: () => void
  couponPending: boolean
  couponError?: string
  actionError?: string
  quoteError?: boolean
  onRefreshQuote: () => void
}) {
  return (
    <aside className="min-w-0 self-start rounded-2xl bg-surface-card p-5 shadow-[0_6px_20px_-8px_rgba(10,6,4,0.55)] lg:sticky lg:top-6 lg:p-6">
      <h2 className="border-b border-border pb-3 text-lg font-bold">
        Resumo da carteira
      </h2>

      <form onSubmit={onApplyCoupon} className="mt-5">
        <label htmlFor="cart-coupon" className="mb-2 block text-sm">
          Código promocional
        </label>
        {couponCode ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3">
            <span className="font-medium text-text-accent">{couponCode}</span>
            <button
              type="button"
              disabled={couponPending}
              onClick={onRemoveCoupon}
              className="text-sm text-text-secondary underline hover:text-foreground disabled:opacity-50"
            >
              Remover cupom
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 rounded-full border border-border">
            <input
              id="cart-coupon"
              value={couponInput}
              onChange={(event) => onCouponInput(event.currentTarget.value)}
              placeholder="Digite o código promocional..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary"
            />
            <button
              type="submit"
              disabled={couponPending || !couponInput.trim()}
              className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {couponPending ? 'Aplicando…' : 'Aplicar'}
            </button>
          </div>
        )}
        {couponError && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {couponError}
          </p>
        )}
      </form>

      {actionError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {actionError}
        </p>
      )}
      {quoteError && (
        <div role="alert" className="mt-4 text-sm text-destructive">
          <p>A cotação não foi atualizada. Confira a conexão antes de continuar.</p>
          <button
            type="button"
            onClick={onRefreshQuote}
            className="mt-2 underline"
          >
            Atualizar cotação
          </button>
        </div>
      )}

      {currencyQuotes.length ? (
        <div className="mt-6 space-y-6">
          {currencyQuotes.map((quote) => (
            <dl key={quote.currency} className="space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <dt>Subtotal ({quote.currency})</dt>
                <dd className="text-right">{quote.subtotal} {quote.currency}</dd>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <dt>Desconto do cupom</dt>
                <dd className="text-right">− {quote.discount} {quote.currency}</dd>
              </div>
              <div className="flex justify-between gap-4 text-sm">
                <dt>Taxa de rede</dt>
                <dd className="text-right">
                  {quote.networkFee === null
                    ? 'Cotação indisponível'
                    : `${quote.networkFee} ${quote.currency}`}
                </dd>
              </div>
              <p className="text-right text-xs text-text-accent">Taxa estimada</p>
              <div className="flex justify-between gap-4 border-t border-border pt-3 font-bold">
                <dt>Total</dt>
                <dd className="text-right text-text-accent">
                  {quote.total === null
                    ? 'Cotação indisponível'
                    : `${quote.total} ${quote.currency}`}
                </dd>
              </div>
            </dl>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-text-secondary">
          Não há itens elegíveis para cotação.
        </p>
      )}

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className="mt-7 w-full rounded-full bg-primary px-5 py-4 font-bold text-primary-foreground hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-45"
      >
        {isAuthenticated ? 'Continuar para pagamento' : 'Entrar para continuar'}
      </button>
      <Link
        to="/"
        hash="mercado"
        className="mt-4 block text-center text-sm text-text-accent hover:underline"
      >
        Continuar explorando
      </Link>
    </aside>
  )
}

function CartPage() {
  const cartQuery = useCart()
  const quoteQuery = useCartQuote()
  const updateMutation = useUpdateCartItem()
  const removeMutation = useRemoveCartItem()
  const couponMutations = useCartCoupon()
  const { user, openAuth } = useAuth()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState<string>()
  // Cotação desatualizada enquanto um `nft.updated` do carrinho chegou e a
  // reconciliação com a API REST ainda não foi concluída.
  const quoteStale = useQuoteStale(quoteQuery.data)

  if (cartQuery.isPending || quoteQuery.isPending) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="mx-auto max-w-[1200px] px-4 py-8 lg:px-0">
          <h1 className="mb-8 text-2xl font-bold">Carrinho de NFTs</h1>
          <CartSkeleton />
        </div>
        <Footer />
      </main>
    )
  }

  if (
    (cartQuery.isError && !cartQuery.data) ||
    (quoteQuery.isError && !quoteQuery.data) ||
    !cartQuery.data ||
    !quoteQuery.data
  ) {
    const refetch = () => {
      void cartQuery.refetch()
      void quoteQuery.refetch()
    }

    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-0">
          <h1 className="text-2xl font-bold">Carrinho de NFTs</h1>
          <p role="alert" className="mt-4 text-text-secondary">
            Não foi possível carregar seu carrinho e a cotação. Tente novamente.
          </p>
          <button
            type="button"
            onClick={refetch}
            className="mt-6 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground"
          >
            Tentar novamente
          </button>
        </section>
        <Footer />
      </main>
    )
  }

  const { items, couponCode } = cartQuery.data
  const quote = quoteQuery.data
  const lines = quote.lines
  const eligibleLines = lines.filter((line) => line.status === 'available')
  const canContinue =
    !quoteQuery.isError &&
    eligibleLines.length > 0 &&
    quote.totals.length > 0 &&
    quote.totals.every((total) => total.networkFee !== null && total.total !== null)
  const actionError = updateMutation.isError || removeMutation.isError
    ? errorMessage(
        updateMutation.error ?? removeMutation.error,
        'Não foi possível atualizar o carrinho. Tente novamente.',
      )
    : undefined
  const couponPending = couponMutations.apply.isPending || couponMutations.remove.isPending

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCouponError(undefined)
    couponMutations.apply.reset()
    couponMutations.apply.mutate(couponInput.trim(), {
      onSuccess: () => setCouponInput(''),
      onError: (error) => {
        setCouponError(errorMessage(error, 'Não foi possível validar o cupom.'))
      },
    })
  }

  function removeCoupon() {
    setCouponError(undefined)
    couponMutations.remove.mutate(undefined, {
      onError: (error) => {
        setCouponError(errorMessage(error, 'Não foi possível remover o cupom.'))
      },
    })
  }

  function continueToPayment() {
    if (!canContinue) return
    if (!user) {
      openAuth('login')
      return
    }
    void navigate({ to: '/payment' })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 lg:px-0 lg:pb-20">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-text-secondary">
          <Link to="/" className="hover:text-text-accent">Início</Link>
          {' / '}
          <Link to="/" hash="mercado" className="hover:text-text-accent">Mercado</Link>
          {' / Carrinho'}
        </nav>

        <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Carrinho de NFTs</h1>

        {quoteStale && (
          <p role="status" className="-mt-4 mb-6 text-sm text-text-secondary">
            Uma alteração de preço/estoque chegou em tempo real. A cotação está
            sendo reconciliada com o servidor.
          </p>
        )}

        {items.length === 0 ? (
          <section className="rounded-2xl border border-border bg-surface-card px-6 py-16 text-center">
            <h2 className="text-xl font-bold">Seu carrinho está vazio</h2>
            <p className="mx-auto mt-3 max-w-md text-text-secondary">
              Explore o mercado e adicione NFTs para vê-los aqui.
            </p>
            <Link
              to="/"
              hash="mercado"
              className="mt-7 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary-dark"
            >
              Voltar ao catálogo
            </Link>
          </section>
        ) : (
          <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
            <section aria-label="Itens do carrinho" className="min-w-0">
            <div className="mb-2 hidden grid-cols-[minmax(220px,1fr)_90px_112px_104px_36px] gap-3 border-b border-border pb-3 text-sm text-text-secondary lg:grid">
                <span>NFTs</span>
                <span>Preço</span>
                <span className="text-center">Quantidade</span>
                <span className="text-right">Total</span>
                <span className="sr-only">Ações</span>
              </div>

              {lines.map((line) => (
                <CartLine
                  key={line.id}
                  line={line}
                  pending={
                    updateMutation.isPending || removeMutation.isPending
                  }
                  onQuantityChange={(quantity) =>
                    updateMutation.mutate({ itemId: line.id, quantity })
                  }
                  onRemove={() => removeMutation.mutate(line.id)}
                />
              ))}
            </section>

            <CartSummary
              onContinue={continueToPayment}
              canContinue={canContinue}
              isAuthenticated={Boolean(user)}
              currencyQuotes={quote.totals}
              couponCode={couponCode}
              couponInput={couponInput}
              onCouponInput={setCouponInput}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
              couponPending={couponPending}
              couponError={couponError}
              actionError={actionError}
              quoteError={quoteQuery.isError}
              onRefreshQuote={() => void quoteQuery.refetch()}
            />
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}

export default CartPage
