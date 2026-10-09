# Jungle Gaming Frontend — NFT Marketplace

Marketplace de NFTs implementado em React + TypeScript com Vite, seguindo o desafio de frontend com mocks MSW para APIs REST e eventos Socket.IO.

URL pública: https://jungle-gaming-frontend-one.vercel.app/

## Setup

### Pré-requisitos

- Node.js 20+ (recomendado: 24.19.0)
- npm 10+

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

O projeto usa uma única variável de ambiente para ativar os mocks MSW:

```bash

cp .env.example .env
```

O arquivo `.env` **não deve ser commitado** (está no `.gitignore`). O arquivo `.env.example` documenta as variáveis necessárias com valores fictícios.

### Desenvolvimento

```bash
npm run dev
```

Acessar http://localhost:5173. Os mocks MSW são ativados quando `VITE_ENABLE_MOCKS=true` (definido em `.env` ou `.env.development`).

### Build de Produção

```bash
npm run build
```

Gera `dist/` otimizado. Para preview local:

```bash
npm run preview
```

Acessar http://localhost:4173.

## Credenciais de Demonstração

| Usuário | Email | Senha |
| --- | --- | --- |
| Ana Kurio | ana@kurio.test | KurioDemo123! |
| Leo Kurio | leo@kurio.test | (verificar em `src/mocks/authHandlers.ts`) |

Ou cadastre uma nova conta via interface (botão "Entrar na conta" → "Criar conta").

## Cenários de Mock

Os mocks MSW simulam APIs REST e eventos Socket.IO. Flags de cenário são controladas via `localStorage`:

| Flag | Efeito |
| --- | --- |
| `kurio:mock:slow-quote` | Atrasa cotação do carrinho (600ms) |
| `kurio:mock:slow-catalog` | Atrasa listagem do catálogo (600ms) |
| `kurio:mock:slow-order` | Atrasa criação de pedido (600ms) |
| `kurio:mock:payment-pending` | Pedido criado como pendente |
| `kurio:mock:manual-settlement` | Liquidação manual via `settleOrder` |
| `kurio:mock:expire-next-session` | Expira sessão na próxima leitura |

### Exemplo: Simular Lentidão

```javascript
// No console do browser
localStorage.setItem('kurio:mock:slow-catalog', 'true')
location.reload()
```

### Reset de Cenário

```javascript
localStorage.clear()
location.reload()
```

## Comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Desenvolvimento com HMR + mocks |
| `npm run build` | Build de produção (tsc + vite) |
| `npm run preview` | Preview do build local |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Testes E2E com Playwright |
| `npx tsc -b --noEmit` | Verificação de tipos |

## Testes E2E

Os testes Playwright cobrem os fluxos principais com mocks determinísticos:

```bash
npm run test:e2e
```

Relatórios HTML e traces são gerados em `test-results/` e `playwright-report/`.

### Cobertura

1. Busca, filtros, ordenação, paginação e histórico
2. Acesso direto a NFT e recurso inexistente
3. Cadastro, login, expiração, logout, troca de usuário
4. Favoritos com falha de mutation
5. Carrinho, quantidades, cupom, persistência
6. Compra completa (catálogo → recibo)
7. Falha de pagamento, clique repetido, timeout
8. Edição de perfil, avatar, senha, carteiras
9. Alteração de preço via Socket.IO durante checkout
10. Eventos duplicados/antigos, desconexão, retomada
11. Navegação por teclado, foco, validação
12. Skeletons, falha, recuperação

## Auditoria Lighthouse

Relatórios em `lighthouse-reports/`:

```bash
# Home mobile
npx lighthouse http://localhost:4173/ --form-factor=mobile --output=json --output=html

# Home desktop
npx lighthouse http://localhost:4173/ --preset=desktop --output=json --output=html

# NFT Detail mobile
npx lighthouse http://localhost:4173/nft/nft-03 --form-factor=mobile --output=json --output=html

# NFT Detail desktop
npx lighthouse http://localhost:4173/nft/nft-03 --preset=desktop --output=json --output=html
```

Execute 3 medições por página/perfil e reporte a mediana.

## Rotas

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/` | Home (Hero + Catálogo + Promos + Blog) | Público |
| `/nft/$nftId` | Detalhe do NFT | Público |
| `/cart` | Carrinho | Autenticado |
| `/payment` | Pagamento | Autenticado |
| `/profile` | Perfil do colecionador | Autenticado |
| `/wallets` | Carteiras | Autenticado |
| `/order/$orderId` | Confirmação de pedido | Autenticado (owner) |

Todas as rotas suportam acesso direto e refresh (SPA fallback).

## Fluxos de Falha

### Simular Expiração de Sessão

```javascript
localStorage.setItem('kurio:mock:expire-next-session', 'true')
location.reload()
```

### Simular Pagamento Pendente

```javascript
localStorage.setItem('kurio:mock:payment-pending', 'true')
localStorage.setItem('kurio:mock:manual-settlement', 'true')

```

### Simular Preço Alterado Durante Checkout

```javascript
window.__mocks?.updateNftPrice('nft-03', '1.99', '1.19')

```

## Arquitetura

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para documentação detalhada de:
- Contratos REST
- Eventos Socket.IO
- Política de cache e reconciliação
- Mocks MSW e test hooks
- Limitações conhecidas

## Deploy

### Vercel (Recomendado)

```bash
npx vercel --prod
```

Vercel detecta Vite automaticamente e configura SPA fallback via `vercel.json`.

### Configuração na Vercel

1. Conecte o repositório GitHub no dashboard da Vercel
2. Em **Settings → Environment Variables**, adicione:
   - Nome: `VITE_ENABLE_MOCKS`
   - Valor: `true`
   - Ambiente: Production, Preview, Development
3. Faça deploy

A variável `VITE_ENABLE_MOCKS` é injetada no build pela Vercel e substituída estaticamente pelo Vite em `import.meta.env.VITE_ENABLE_MOCKS` (ver `src/main.tsx`).

### Variáveis de Ambiente

| Variável | Valor | Uso |
| --- | --- | --- |
| `VITE_ENABLE_MOCKS` | `true` | Ativa mocks MSW para desenvolvimento, demonstração e testes |
| `VITE_ENABLE_MOCKS` | `false` ou omitido | Usa APIs reais (quando disponíveis) |

**Nota:** O prefixo `VITE_` é obrigatório para que a variável seja exposta ao código cliente pelo Vite.

## Stack

- React 19 + TypeScript 6
- Vite 8
- TanStack Router 1.170 + TanStack Query 5.104
- Axios 1.20
- Socket.IO Client 4.8 + @mswjs/socket.io-binding 0.2
- Tailwind CSS 4 + shadcn/ui
- MSW 3
- Playwright 1.64
- Lighthouse 13.5

## Licença

Propriedade intelectual do candidato. Uso exclusivo para avaliação do desafio.
