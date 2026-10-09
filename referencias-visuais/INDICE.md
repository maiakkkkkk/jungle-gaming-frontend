# Referências visuais Kurio

Os PDFs são a referência visual. Os exports `.ts` complementam com conteúdo e estrutura; use-os como orientação, sem copiá-los literalmente.

## Exports de código (`.ts`)

### Desktop

- Detalhes do NFT — `detalhes do nft.ts`
- Carrinho — `carrinho de nfts.ts`
- Pagamento — `pagamento.ts`
- Confirmação de pedido — `confirmação de pedido.ts`
- Login (modal) — `login-modal.ts`
- Cadastro (modal) — `cadastro-modal.ts`
- Perfil do Colecionador — `perfil do colecionador.ts`
- Carteiras — `carteiras.ts`

### Mobile

- Início — `inicio-mobile.ts`
- Detalhes do NFT — `detalhes do nft-mobile.ts`
- Carrinho — `carrinho de nfts-mobile.ts`
- Pagamento — `pagamento-mobile.ts`
- Login — `login-mobile.ts`
- Cadastro — `cadastro-mobile.ts`

Não há export desktop de código para Início. O export atual `detalhes do nft.ts` foi conferido: representa a tela desktop de Mercado, com o NFT Emerald Ape #042, edição, avaliações, atributos e ações de compra/favorito.

## PDFs disponíveis (15)

- `referencias-visuais/pdfs/Cadastro.pdf`
- `referencias-visuais/pdfs/Cadastro-mobile.pdf`
- `referencias-visuais/pdfs/Carrinho de NFTs.pdf`
- `referencias-visuais/pdfs/Carrinho de NFTs-mobile.pdf`
- `referencias-visuais/pdfs/Carteiras.pdf`
- `referencias-visuais/pdfs/Confirmação de Pedido.pdf`
- `referencias-visuais/pdfs/Detalhes do NFT.pdf`
- `referencias-visuais/pdfs/Detalhes do NFT-mobile.pdf`
- `referencias-visuais/pdfs/Início.pdf`
- `referencias-visuais/pdfs/Início-mobile.pdf`
- `referencias-visuais/pdfs/Login.pdf`
- `referencias-visuais/pdfs/Login-mobile.pdf`
- `referencias-visuais/pdfs/Pagamento.pdf`
- `referencias-visuais/pdfs/Pagamento-mobile.pdf`
- `referencias-visuais/pdfs/Perfil do Colecionador.pdf`

## Mapeamento por tela

| Tela | Export desktop | Export mobile | PDFs | Observações |
|---|---|---|---|---|
| Início | — | `inicio-mobile.ts` | `Início.pdf`; `Início-mobile.pdf` | Há PDF desktop, mas não export desktop de código. |
| Detalhes do NFT | `detalhes do nft.ts` | `detalhes do nft-mobile.ts` | `Detalhes do NFT.pdf`; `Detalhes do NFT-mobile.pdf` | — |
| Carrinho | `carrinho de nfts.ts` | `carrinho de nfts-mobile.ts` | `Carrinho de NFTs.pdf`; `Carrinho de NFTs-mobile.pdf` | — |
| Pagamento | `pagamento.ts` | `pagamento-mobile.ts` | `Pagamento.pdf`; `Pagamento-mobile.pdf` | — |
| Confirmação de pedido | `confirmação de pedido.ts` | — | `Confirmação de Pedido.pdf` | Sem referência mobile específica; o README exige adaptação responsiva. |
| Login | `login-modal.ts` | `login-mobile.ts` | `Login.pdf`; `Login-mobile.pdf` | Export desktop é modal. |
| Cadastro | `cadastro-modal.ts` | `cadastro-mobile.ts` | `Cadastro.pdf`; `Cadastro-mobile.pdf` | Export desktop é modal. |
| Perfil do Colecionador | `perfil do colecionador.ts` | — | `Perfil do Colecionador.pdf` | Sem referências mobile específicas; adaptar depois seguindo o padrão visual e o README. |
| Carteiras | `carteiras.ts` | — | `Carteiras.pdf` | Sem referências mobile específicas; adaptar depois seguindo o padrão visual e o README. |

## Inspeção visual dos PDFs

Foram visualizadas as páginas dos 15 PDFs (cada arquivo tem uma página): Início, Detalhes do NFT, Carrinho, Pagamento, Login e Cadastro em desktop e mobile; Confirmação de pedido, Perfil do Colecionador e Carteiras em desktop.
