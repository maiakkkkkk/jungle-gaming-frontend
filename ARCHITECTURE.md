# Arquitetura — Jungle Gaming Frontend

## Visão Geral

Marketplace de NFTs implementado em React + TypeScript com Vite. A aplicação usa mocks MSW para simular APIs REST e eventos Socket.IO, permitindo desenvolvimento, demonstração e testes E2E sem backend real.

## Stack

| Responsabilidade | Tecnologia |
| --- | --- |
| Interface | React 19 |
| Linguagem | TypeScript 6 |
| Build | Vite 8 |
| Roteamento | TanStack Router 1.170 |
| Estado remoto | TanStack Query 5.104 |
| Cliente HTTP | Axios 1.20 |
| Tempo real | Socket.IO Client 4.8 + @mswjs/socket.io-binding 0.2 |
| Estilização | Tailwind CSS 4 + shadcn/ui |
| Mocking | MSW 3 |
| Testes E2E | Playwright 1.64 |
| Auditoria | Lighthouse 13.5 |

## Estrutura de Diretórios

```
src/
├── components/
│   ├── account/      # Shell de páginas privadas (Profile, Wallets)
│   ├── auth/         # AuthDialog, AuthProvider, useAuth
│   ├── home/         # Hero, Products, ProductGrid, ProductsSidebar, Promos, Blog
│   ├── layout/       # Header, Footer
│   └── ui/           # Componentes shadcn (Button, Badge)
├── hooks/            # useNft, useNfts, useOrders, useCollector, useMarketplace
├── lib/              # api (Axios), utils, sessionToken, pendingOrder
├── mocks/            # MSW handlers, authHandlers, socketHandlers, testHooks, nftStore
├── pages/            # Cart, NftDetails, OrderConfirmation, Payment, Profile, Wallets
├── realtime/         # socketClient, RealtimeSync
├── services/         # collector, marketplace, nfts, session
├── App.tsx           # Layout principal
├── main.tsx          # Bootstrap com MSW + dynamic imports
└── router.tsx        # TanStack Router com rotas e validateSearch
```

## Rotas

| Rota | Componente | Acesso |
| --- | --- | --- |
| `/` | App (Hero + Products + Promos + Blog) | Público |
| `/nft/$nftId` | NftDetails | Público |
| `/cart` | CartPage | Autenticado |
| `/payment` | PaymentPage | Autenticado |
| `/profile` | ProfilePage | Autenticado |
| `/wallets` | WalletsPage | Autenticado |
| `/order/$orderId` | OrderConfirmationPage | Autenticado (owner-scoped) |

Parâmetros de busca da Home (`CatalogSearch`): `q`, `view`, `collection`, `network`, `minPrice`, `maxPrice`, `sort`, `page`. Todos persistem na URL e sobrevivem a refresh.

## Contratos REST

### Sessão e Conta

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/api/accounts` | Cadastro (username, email, password) |
| POST | `/api/session` | Login (email, password) → accessToken + session |
| GET | `/api/session` | Consulta da sessão atual (Bearer token) |
| DELETE | `/api/session` | Logout |

### NFTs

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/nfts` | Listagem com busca/filtros/ordenação/paginação |
| GET | `/api/nfts/:id` | Detalhe por identificador |

### Favoritos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/favorites` | Lista de favoritos do usuário |
| POST | `/api/favorites` | Adicionar favorito |
| DELETE | `/api/favorites/:nftId` | Remover favorito |

### Carrinho

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/cart` | Carrinho atual |
| POST | `/api/cart/items` | Adicionar item |
| PUT | `/api/cart/items/:nftId` | Alterar quantidade |
| DELETE | `/api/cart/items/:nftId` | Remover item |
| PUT | `/api/cart/coupon` | Aplicar cupom (KURIO10=10%, EXPIRADO10→410) |
| GET | `/api/cart/quote` | Cotação com subtotal, desconto, taxa, total |

### Pedidos

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/api/orders` | Criação idempotente (chave + fingerprint) |
| GET | `/api/orders/:id` | Consulta do estado e recibo (owner-scoped) |

### Perfil

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/profile` | Dados do perfil |
| PUT | `/api/profile` | Atualização de dados/avatar |
| PUT | `/api/profile/password` | Alteração de senha |

### Carteiras

| Método | Endpoint | Descrição |
| --- | --- | --- |
| GET | `/api/wallets` | Carteiras cadastradas |
| PUT | `/api/wallets` | Cadastro/atualização |

### Códigos de Erro

| Código HTTP | Cenário |
| --- | --- |
| 401 | Sessão expirada ou token inválido |
| 404 | Recurso inexistente ou acesso não autorizado (owner-scoped) |
| 409 | Conflito (idempotência, cadastro duplicado, username/email em uso) |
| 410 | Cupom expirado |
| 422 | Erro de validação de campos |

## Mocks MSW

### Arquitetura

Os mocks operam na camada de rede via MSW v3, reutilizando contratos entre desenvolvimento, demonstração e testes. Componentes e hooks não contêm respostas fictícias.

### Persistência

Estado persistido em `localStorage`:
- `kurio:mock:accounts:v1` — contas de demonstração (ana, leo) + cadastradas
- `kurio:mock:sessions:v1` — sessões ativas
- `kurio:mock:collector-profile:v1` — perfis editados
- `kurio:mock:wallets:v1` — carteiras cadastradas
- `kurio:mock:orders:v1` — pedidos criados
- `kurio:mock:cart:v1` — carrinho
- `kurio:mock:favorites:v1` — favoritos
- `kurio:mock:nfts:v1` — catálogo (12 NFTs seed)

### Flags de Cenário

| Flag | Efeito |
| --- | --- |
| `kurio:mock:slow-quote` | Atrasa cotação do carrinho (600ms) |
| `kurio:mock:slow-catalog` | Atrasa listagem do catálogo (600ms) |
| `kurio:mock:slow-order` | Atrasa criação de pedido (600ms) |
| `kurio:mock:payment-pending` | Pedido criado como pendente |
| `kurio:mock:manual-settlement` | Liquidação manual via `settleOrder` |
| `kurio:mock:expire-next-session` | Expira sessão na próxima leitura |

### Test Hooks

`window.__mocks` expõe gatilhos determinísticos para testes E2E:
- `setSlowQuote(enabled)`, `setSlowCatalog(enabled)`, `setSlowOrder(enabled)`
- `setPendingPayment(enabled)`, `setManualSettlement(enabled)`
- `updateNftPrice(nftId, price, oldPrice?)` — emite `nft.updated`
- `emitNftUpdatedEvent(nftId, override?)` — emite evento com versão
- `settleOrder(orderId, status)` — liquida pedido pendente
- `setSocketConnected(connected)` — conecta/desconecta Socket.IO

## Tempo Real — Socket.IO

### Eventos

| Evento | Direção | Comportamento |
| --- | --- | --- |
| `nft.updated` | Servidor → Cliente | Atualiza preço/disponibilidade no catálogo, detalhe e carrinho |
| `order.updated` | Servidor → Cliente | Atualiza estado do pedido (pending → confirmed/declined) |

### Protocolo

Os eventos carregam: `nftId`/`orderId`, `version` (monotônica), `price`, `available`. O cliente descarta eventos com `version <= applied` para tolerar duplicatas e eventos antigos.

### Reconciliação

Após reconexão (`connect` event), `RealtimeSync` invalida as queries ativas (`['nfts']`, `['nft']`, `['cartQuote']`, pending orders) para reconciliar com a API REST.

### Limitações do Mock

- `@mswjs/socket.io-binding` simula o transporte Socket.IO via MSW
- Eventos são emitidos via `window.__mocks` nos testes
- Em produção, o socket conectaria a um servidor real

## Autenticação e Sessão

### Fluxo

1. Login → POST `/api/session` → accessToken armazenado em memória
2. Token enviado via header `Authorization: Bearer <token>`
3. Sessão persistida em `kurio:mock:sessions:v1` (localStorage)
4. Refresh → GET `/api/session` recupera sessão
5. Expiração → 401 → AuthDialog exibe notice e solicita re-login
6. Logout → DELETE `/api/session` → limpa token e cache privado

### Credenciais de Demonstração

| Usuário | Email | Senha |
| --- | --- | --- |
| Ana Kurio | ana@kurio.test | KurioDemo123! |
| Leo Kurio | leo@kurio.test | (verificar em authHandlers.ts) |

## Carrinho e Checkout

### Estado do Carrinho

- Persistido em `kurio:mock:cart:v1`
- Sobrevive a refresh
- Preservado ao autenticar (merge com carrinho anônimo)

### Idempotência de Pedidos

- Chave de idempotência: `scopedKey` (userId + cart fingerprint)
- Mesma chave + mesmo conteúdo → recupera pedido existente
- Mesma chave + conteúdo diferente → 409 IDEMPOTENCY_CONFLICT
- Tentativa local armazenada em `kurio:pending-order` até resposta definitiva

### Recuperação de Pedido Pendente

- Pedido criado como `pending` → URL `/order/{id}` exibe "Pagamento em processamento"
- Refresh mantém estado via `kurio:pending-order`
- `order.updated` event → transição para `confirmed` ou `declined`
- Pedidos terminais (confirmed/declined) não podem ser reabertos

## Política de Cache

### TanStack Query

- `queryKey` inclui parâmetros de busca para isolamento
- `staleTime` padrão: 0 (sempre revalida)
- `retry`: 3 tentativas com backoff (exceto 404 → retry skip)
- `refetchOnWindowFocus`: true
- Invalidação após mutations: `queryClient.invalidateQueries()`

### Otimista

- Favoritos: atualização otimista com rollback em falha

## Decisões de UX

- Skeletons com `role="status"` e `aria-label` durante carregamento
- Diálogos restauram foco ao gatilho após fechamento (Escape)
- Formulários exibem erros por campo com `aria-invalid` e `aria-describedby`
- Navegação por teclado: foco visível em todos os elementos interativos

## Limitações Conhecidas

1. **Performance LCP Mobile**: 5.04s (meta ≥ 90 não atingida). Causa: imagem Hero PNG 341KB para exibição 112x112px. Otimização exigiria conversão para WebP/AVIF (ferramentas não disponíveis sem instalar dependências).

2. **SEO**: 82-83 (meta ≥ 90 não atingida). Causa: meta tags incompletas, falta de sitemap.

3. **LSP False Positives**: TanStack Router augmentação de tipos não aplicada pelo LSP do editor. `npx tsc -b` confirma código correto.

4. **Socket.IO em Testes**: Import estático de `socket.io-client` antes de `worker.start()` captura `globalThis.WebSocket` não-patchado. Solução: dynamic import dentro dos hooks.

## Comandos

```bash
# Desenvolvimento com mocks
npm run dev              # http://localhost:5173

# Build de produção
npm run build            # tsc -b && vite build

# Preview do build
npm run preview          # http://localhost:4173

# Verificação de tipos
npx tsc -b --noEmit

# Lint
npm run lint

# Testes E2E
npm run test:e2e         # Playwright (requer build + preview)

# Auditoria Lighthouse
npx lighthouse http://localhost:4173/ --form-factor=mobile --output=json --output=html
```

## Deploy

A versão publicada deve corresponder ao código entregue. Recomenda-se Vercel (suporte nativo a Vite + SPA fallback).

### Vercel

```bash
npx vercel --prod
```

Configuração automática detecta Vite. SPA fallback garantido para rotas diretas.

### Variáveis de Ambiente

- `VITE_ENABLE_MOCKS=true` — ativa MSW (desenvolvimento/demo)
- Em produção, omitir para usar APIs reais (quando disponíveis)
