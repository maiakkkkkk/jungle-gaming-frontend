import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/useAuth'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { useCollectorProfile, useCollectorWallets } from '@/hooks/useCollector'
import { useCartQuote } from '@/hooks/useMarketplace'
import { useCreateOrder, useOrder } from '@/hooks/useOrders'
import {
  clearPendingOrderAttempt,
  readPendingOrderAttempt,
  writePendingOrderAttempt,
} from '@/lib/pendingOrder'
import { useLatestNftEvent, useQuoteStale } from '@/realtime/useRealtimeFeed'
import type { CollectorApiError, CollectorWallet } from '@/services/collector'

const providers = ['WalletConnect', 'MetaMask', 'Coinbase Wallet', 'Recusar pagamento']

function PaymentPage() {
  const { user, isLoading, openAuth } = useAuth()
  const navigate = useNavigate()
  const profile = useCollectorProfile().profile
  const walletQuery = useCollectorWallets().wallets
  const quote = useCartQuote()
  const createOrder = useCreateOrder()
  const [walletIndex, setWalletIndex] = useState(0)
  const [provider, setProvider] = useState('')
  const [error, setError] = useState('')
  const quoteStale = useQuoteStale(quote.data)
  const quoteNftIds = useMemo(
    () => quote.data?.lines.map((line) => line.nftId) ?? [],
    [quote.data],
  )
  const latestNftEvent = useLatestNftEvent(quoteNftIds)
  // Tentativa de compra persistida localmente, relida quando a sessão muda.
  const pendingAttempt = useMemo(
    () => (user ? readPendingOrderAttempt(user.id) : null),
    [user],
  )
  const recoveryOrder = useOrder(pendingAttempt?.orderId ?? undefined)
  const wallets = useMemo(() => {
    const value = walletQuery.data
    if (!value) return [] as { label: string; wallet: CollectorWallet }[]
    const list: { label: string; wallet: CollectorWallet }[] = []
    if (value.primary) list.push({ label: 'Principal', wallet: value.primary })
    if (value.secondary) list.push({ label: 'Secundária', wallet: value.secondary })
    if (value.secondaryUsesPrimary && value.primary) list.push({ label: 'Secundária (principal)', wallet: value.primary })
    return list
  }, [walletQuery.data])
  const selected = wallets[walletIndex]
  useEffect(() => { if (!isLoading && !user) openAuth('login') }, [isLoading, openAuth, user])
  // Recupera o estado de uma tentativa anterior sem criar outra compra. O
  // aviso de recusa é derivado do pedido recuperado, sem estado adicional.
  useEffect(() => {
    const data = recoveryOrder.data
    if (!data || data.id !== pendingAttempt?.orderId || data.status === 'pending') return
    clearPendingOrderAttempt(data.id)
    if (data.status === 'confirmed') {
      void navigate({ to: '/order/$orderId', params: { orderId: data.id } })
    }
  }, [navigate, pendingAttempt, recoveryOrder.data])
  const recoveredDeclined =
    pendingAttempt?.orderId != null &&
    recoveryOrder.data?.id === pendingAttempt.orderId &&
    recoveryOrder.data.status === 'declined'
  const resumable = Boolean(
    pendingAttempt?.orderId && recoveryOrder.data?.status === 'pending',
  )
  async function confirm() {
    setError('')
    if (!selected || !provider || !user) { setError('Selecione uma carteira e um provedor para continuar.'); return }
    // Reaproveita a chave de idempotência de uma tentativa não concluída.
    const stored = readPendingOrderAttempt(user.id)
    const idempotencyKey =
      stored && !stored.orderId ? stored.idempotencyKey : crypto.randomUUID()
    writePendingOrderAttempt({ orderId: null, idempotencyKey, userId: user.id, createdAt: new Date().toISOString() })
    try {
      const order = await createOrder.mutateAsync({ idempotencyKey, wallet: { label: selected.label, address: selected.wallet.address, network: selected.wallet.network, provider } })
      if (order.status === 'pending') {
        writePendingOrderAttempt({ orderId: order.id, idempotencyKey, userId: user.id, createdAt: new Date().toISOString() })
        await navigate({ to: '/order/$orderId', params: { orderId: order.id } })
        return
      }
      // Resposta definitiva (confirmada ou recusada): a tentativa local é
      // liberada por completo, inclusive a chave de idempotência já consumida
      // pelo servidor — reutilizá-la rejeitaria a próxima compra (409).
      clearPendingOrderAttempt()
      if (order.status === 'confirmed') await navigate({ to: '/order/$orderId', params: { orderId: order.id } })
      else setError(order.declineReason ?? 'O pagamento foi recusado. Seu carrinho foi preservado.')
    } catch (cause) {
      if (isAxiosError(cause) && !cause.response) {
        // Falha de rede: a tentativa é mantida para reaproveitar a chave de idempotência.
        setError('Não foi possível confirmar o pedido. Verifique a conexão e tente novamente.')
        return
      }
      clearPendingOrderAttempt()
      setError(isAxiosError<CollectorApiError>(cause) ? cause.response?.data.message ?? 'Não foi possível confirmar o pedido.' : 'Não foi possível confirmar o pedido.')
    }
  }
  const usable = quote.data?.lines.filter((line) => line.status === 'available') ?? []
  return <main className="min-h-screen bg-background text-foreground"><Header /><section className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-0 lg:py-14"><p className="mb-6 text-sm text-text-secondary">Início / Mercado / Pagamento</p>
    {resumable && pendingAttempt?.orderId && <div role="status" className="mb-6 rounded-lg border border-border bg-surface-card p-4 text-sm">Você tem um pedido pendente. <Link className="text-text-accent underline" to="/order/$orderId" params={{ orderId: pendingAttempt.orderId }}>Retomar pedido</Link> — retomar não cria outra compra.</div>}
    {!user ? <section className="rounded-lg bg-surface-card p-7 text-center"><h1 className="text-xl font-bold">Entre para continuar</h1><Button className="mt-4" onClick={() => openAuth('login')}>Entrar</Button></section> : <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_400px]"><div className="min-w-0 space-y-7"><section><h1 className="text-xl font-bold">Pagamento com carteira</h1><p className="mt-2 text-sm text-text-secondary">Revise sua conta e escolha uma carteira simulada.</p></section><section className="grid gap-4 rounded-lg bg-surface-card p-5 sm:grid-cols-2"><div><h2 className="font-bold">Perfil do colecionador</h2><p className="mt-3 text-sm">{profile.data?.displayName ?? 'Carregando…'}</p><p className="text-sm text-text-secondary">{profile.data?.email}</p></div><div><h2 className="font-bold">Rede do pedido</h2><p className="mt-3 text-sm text-text-secondary">Cada pedido usa uma única rede. Itens de moedas ou redes diferentes permanecem separados.</p></div></section><section><h2 className="mb-3 font-bold">Carteira conectada</h2>{wallets.length ? <div className="grid gap-3">{wallets.map((entry, index) => <label key={`${entry.label}-${index}`} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${walletIndex === index ? 'border-primary bg-surface-card' : 'border-border'}`}><input type="radio" name="wallet" checked={walletIndex === index} onChange={() => setWalletIndex(index)} /><span><strong>{entry.label}: {entry.wallet.nickname}</strong><span className="mt-1 block text-sm text-text-secondary">{entry.wallet.address} · {entry.wallet.network}</span></span></label>)}</div> : <div className="rounded-lg bg-surface-card p-4 text-sm text-text-secondary">Nenhuma carteira válida foi cadastrada. <Link to="/wallets" className="text-text-accent underline">Cadastrar carteira</Link></div>}</section><section><h2 className="mb-3 font-bold">Carteira e rede</h2><div className="grid gap-3 sm:grid-cols-2">{providers.map((name) => <label key={name} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${provider === name ? 'border-primary bg-surface-card' : 'border-border'}`}><input type="radio" name="provider" checked={provider === name} onChange={() => setProvider(name)} />{name}</label>)}</div></section></div><aside className="h-fit rounded-lg bg-surface-card p-5"><h2 className="mb-4 font-bold">Seus NFTs</h2>{quote.isPending ? <p className="flex gap-2 text-sm"><LoaderCircle className="size-4 animate-spin" /> Atualizando cotação…</p> : <><div className="space-y-3 border-b border-border pb-4">{usable.map((line) => <div key={line.id} className="flex gap-3"><img src={line.image} alt="" className="size-12 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{line.name}</p><p className="text-xs text-text-secondary">Edição {line.editionLabel} · x{line.quantity}</p></div><strong className="text-sm text-text-accent">{line.lineTotal} {line.currency}</strong></div>)}</div><div className="mt-4 space-y-2">{quote.data?.totals.map((total) => <div key={total.currency} className="border-b border-border pb-3 text-sm"><div className="flex justify-between"><span>Subtotal ({total.currency})</span><span>{total.subtotal} {total.currency}</span></div><div className="flex justify-between text-text-secondary"><span>Desconto</span><span>- {total.discount} {total.currency}</span></div><div className="flex justify-between text-text-secondary"><span>Taxa de rede</span><span>{total.networkFee ?? 'Indisponível'}{total.networkFee ? ` ${total.currency}` : ''}</span></div><div className="mt-2 flex justify-between font-bold"><span>Total</span><span className="text-text-accent">{total.total ?? 'Indisponível'}{total.total ? ` ${total.currency}` : ''}</span></div></div>)}</div></>}{latestNftEvent && <p role="status" className="mt-4 text-sm text-text-secondary">Alteração de preço/estoque recebida em tempo real. A cotação é reconciliada com o servidor antes da confirmação.</p>}{quoteStale && <p role="alert" className="mt-4 text-sm text-destructive">A cotação mudou após uma atualização em tempo real. Atualize os valores antes de confirmar.</p>}{recoveredDeclined && <p role="alert" className="mt-4 text-sm text-destructive">Seu pedido anterior foi recusado. Revise os dados e tente novamente.</p>}{error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}<Button className="mt-5 w-full" disabled={!usable.length || !selected || !provider || createOrder.isPending || quoteStale || resumable} onClick={() => void confirm()}>{quoteStale ? 'Atualizando cotação…' : createOrder.isPending ? 'Confirmando…' : 'Confirmar compra'}</Button><Link to="/cart" className="mt-4 block text-center text-sm text-text-accent">Voltar ao carrinho</Link></aside></div>}</section><Footer /></main>
}
export default PaymentPage
