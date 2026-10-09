import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useOrder } from '@/hooks/useOrders'
import { clearPendingOrderAttempt } from '@/lib/pendingOrder'

function OrderConfirmationPage() {
  const { orderId } = useParams({ from: '/order/$orderId' })
  const order = useOrder(orderId)

  // Estados terminais liberam a tentativa local de compra — tanto por evento
  // em tempo real quanto pela consulta REST (recarga ou reconexão).
  useEffect(() => {
    const data = order.data
    if (data && data.status !== 'pending') clearPendingOrderAttempt(data.id)
  }, [order.data])

  if (order.isPending) return <main><Header /><p role="status" className="py-20 text-center"><LoaderCircle className="mr-2 inline size-5 animate-spin" /> Recuperando pedido…</p></main>
  if (order.isError || !order.data) return <main><Header /><section className="mx-auto max-w-lg px-4 py-20 text-center"><h1 className="text-xl font-bold">Pedido indisponível</h1><p className="mt-3 text-text-secondary">Não foi encontrada uma confirmação válida para este pedido.</p><Link to="/cart" className="mt-5 inline-block text-text-accent underline">Voltar ao carrinho</Link></section><Footer /></main>
  const data = order.data
  if (data.status === 'pending') return <main className="min-h-screen bg-background text-foreground"><Header /><section className="mx-auto max-w-[560px] px-4 py-12 text-center sm:py-20"><LoaderCircle aria-hidden="true" className="mx-auto size-12 animate-spin text-text-accent" /><h1 className="mt-4 text-xl font-bold">Pagamento em processamento</h1><p role="status" className="mt-3 text-text-secondary">O pedido {data.id.slice(-8)} foi registrado e a transação está sendo confirmada na rede simulada. Esta página é atualizada automaticamente — não é necessário fazer nada.</p><Link to="/cart" className="mt-6 inline-block text-text-accent underline">Voltar ao carrinho</Link></section><Footer /></main>
  if (data.status === 'declined') return <main className="min-h-screen bg-background text-foreground"><Header /><section className="mx-auto max-w-[560px] px-4 py-12 text-center sm:py-20"><XCircle aria-hidden="true" className="mx-auto size-12 text-destructive" /><h1 className="mt-4 text-xl font-bold">Pagamento não confirmado</h1><p role="alert" className="mt-3 text-text-secondary">{data.declineReason ?? 'O pagamento foi recusado. Seu carrinho foi preservado.'}</p><Link to="/cart" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary-dark">Voltar ao carrinho</Link></section><Footer /></main>
  return <main className="min-h-screen bg-background text-foreground"><Header /><section className="mx-auto max-w-[560px] px-4 py-12 sm:py-20"><article className="overflow-hidden rounded-lg bg-surface-card"><header className="border-b border-primary p-7 text-center"><CheckCircle2 className="mx-auto size-12 text-text-accent" /><h1 className="mt-4 text-xl font-bold">Seus NFTs agora estão na sua carteira</h1></header><div className="grid grid-cols-2 gap-3 border-b border-border p-5 text-sm sm:grid-cols-4"><div><span className="block text-text-secondary">Pedido</span>{data.id.slice(-8)}</div><div><span className="block text-text-secondary">Data</span>{new Date(data.createdAt).toLocaleDateString('pt-BR')}</div><div><span className="block text-text-secondary">Carteira</span>{data.wallet.provider}</div><div><span className="block text-text-secondary">Rede</span>{data.wallet.network}</div></div><div className="p-5"><h2 className="mb-4 font-bold">Detalhes da transação</h2><div className="space-y-4">{data.lines.map((line) => <div key={line.id} className="flex items-center gap-3"><img src={line.image} alt="" className="size-14 rounded object-cover"/><div className="min-w-0 flex-1"><p className="truncate font-bold">{line.name}</p><p className="text-sm text-text-secondary">Edição {line.editionLabel} · x{line.quantity}</p></div><strong className="text-text-accent">{line.lineTotal} {line.currency}</strong></div>)}</div><div className="mt-5 space-y-2 border-t border-border pt-4">{data.totals.map((total) => <div key={total.currency} className="flex justify-between"><span>Total {total.currency}</span><strong className="text-text-accent">{total.total} {total.currency}</strong></div>)}</div><p className="mt-6 text-center text-sm text-text-secondary">Transação confirmada na rede simulada. Referência: {data.transactionId}</p><Link to="/" className="mx-auto mt-5 flex w-fit rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Continuar explorando</Link></div><div className="h-2 bg-primary" /></article></section><Footer /></main>
}
export default OrderConfirmationPage
