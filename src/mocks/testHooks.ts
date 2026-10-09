import {
  emitNftUpdatedEvent,
  updateNftEditionStock,
  updateNftPrice,
} from './nftStore'
import { MANUAL_SETTLEMENT_FLAG, PAYMENT_PENDING_FLAG } from './orderStore'
import {
  SLOW_CATALOG_FLAG,
  SLOW_ORDER_FLAG,
  SLOW_QUOTE_FLAG,
  settleOrder,
} from './handlers'

/**
 * Gatilhos determinísticos dos cenários de tempo real. Disponíveis apenas
 * quando a camada de mocks está ativa. Os eventos disparados aqui percorrem
 * o mesmo caminho de produção: estado simulado → servidor Socket.IO (MSW) →
 * `socket.io-client` → sincronização do cache.
 */
export type MockTestHooks = {
  updateNftPrice: (nftId: string, price: string, oldPrice?: string) => boolean
  updateNftEditionStock: (
    nftId: string,
    editionId: string,
    availableQuantity: number,
  ) => boolean
  /** Reemite o evento atual ou uma versão forçada (duplicado/antigo). */
  emitNftUpdatedEvent: (
    nftId: string,
    override?: { version?: number; price?: string },
  ) => boolean
  setPendingPayment: (enabled: boolean) => void
  setManualSettlement: (enabled: boolean) => void
  settleOrder: (orderId: string, status: 'confirmed' | 'declined') => boolean
  /** Atrasa a cotação REST para tornar determinística a janela de cotação desatualizada. */
  setSlowQuote: (enabled: boolean) => void
  /** Atrasa a listagem do catálogo para tornar o skeleton observável. */
  setSlowCatalog: (enabled: boolean) => void
  /** Atrasa a criação do pedido para tornar determinístico o clique repetido. */
  setSlowOrder: (enabled: boolean) => void
  /** Desconecta ou religa o cliente Socket.IO real para os cenários de reconexão. */
  setSocketConnected: (connected: boolean) => void
}

declare global {
  interface Window {
    __mocks?: MockTestHooks
  }
}

export function installMockTestHooks() {
  window.__mocks = {
    updateNftPrice: (nftId, price, oldPrice) =>
      updateNftPrice(nftId, price, oldPrice) !== null,
    updateNftEditionStock: (nftId, editionId, availableQuantity) =>
      updateNftEditionStock(nftId, editionId, availableQuantity) !== null,
    emitNftUpdatedEvent: (nftId, override) =>
      emitNftUpdatedEvent(nftId, override) !== null,
    setPendingPayment: (enabled) => {
      if (enabled) window.localStorage.setItem(PAYMENT_PENDING_FLAG, 'true')
      else window.localStorage.removeItem(PAYMENT_PENDING_FLAG)
    },
    setManualSettlement: (enabled) => {
      if (enabled) window.localStorage.setItem(MANUAL_SETTLEMENT_FLAG, 'true')
      else window.localStorage.removeItem(MANUAL_SETTLEMENT_FLAG)
    },
    settleOrder: (orderId, status) => settleOrder(orderId, status) !== null,
    setSlowQuote: (enabled) => {
      if (enabled) window.localStorage.setItem(SLOW_QUOTE_FLAG, 'true')
      else window.localStorage.removeItem(SLOW_QUOTE_FLAG)
    },
    setSlowCatalog: (enabled) => {
      if (enabled) window.localStorage.setItem(SLOW_CATALOG_FLAG, 'true')
      else window.localStorage.removeItem(SLOW_CATALOG_FLAG)
    },
    setSlowOrder: (enabled) => {
      if (enabled) window.localStorage.setItem(SLOW_ORDER_FLAG, 'true')
      else window.localStorage.removeItem(SLOW_ORDER_FLAG)
    },
    setSocketConnected: (connected) => {
      // Import dinâmico: `socket.io-client` captura `globalThis.WebSocket` na
      // avaliação do módulo e precisa ser carregado apenas depois de o worker
      // do MSW estar ativo — o mesmo motivo do bootstrap em `main.tsx`.
      void import('../realtime/socketClient').then(({ getSocket }) => {
        const socket = getSocket()
        if (connected) socket.connect()
        else socket.disconnect()
      })
    },
  }
}
