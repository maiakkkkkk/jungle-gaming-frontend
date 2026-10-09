# Contratos REST do carrinho (MSW)

Todas as operações usam Axios em `/api`. O mock aceita carrinho visitante; quando há sessão, os itens ficam associados ao ID do usuário. A primeira consulta autenticada mescla os itens do visitante e conserva itens antigos indisponíveis para revisão/remoção.

| Método e rota | Uso |
| --- | --- |
| `GET /cart` | Retorna `{ items, couponCode? }`. |
| `POST /cart/items` | Adiciona `{ nftId, editionId, editionLabel, quantity }`; responde `409` para edição indisponível ou estoque insuficiente. |
| `PATCH /cart/items/:itemId` | Atualiza `{ quantity }`; exige inteiro positivo dentro do estoque, com `422` para quantidade inválida e `409` para conflito de estoque. |
| `DELETE /cart/items/:itemId` | Remove um item mesmo quando sua edição não está mais disponível. |
| `GET /cart/quote` | Retorna linhas com disponibilidade e valores, além de totais separados por moeda. Valores monetários são strings decimais. Linhas indisponíveis ou com estoque insuficiente não entram nos totais. |
| `PUT /cart/coupon` | Recebe `{ code }`, valida e persiste o cupom no estado do carrinho. |
| `DELETE /cart/coupon` | Remove o cupom aplicado. |

O mock não soma moedas diferentes. A taxa disponível nesta fixture é `0.016 ETH`; se uma cotação não tiver taxa definida, `networkFee` e `total` retornam `null` e a continuação fica bloqueada.

As chaves de cache são separadas por `guest` ou ID do usuário. Consultas autenticadas usam `meta.private` para participar da limpeza de sessão. Alterações de quantidade e remoção são otimistas, com rollback se a mutation falhar; cada mutation invalida a cotação. Enquanto a tela está aberta, a cotação é consultada novamente a cada 15 segundos.

Os códigos fictícios e seus cenários estão em [CUPONS-TESTE.md](CUPONS-TESTE.md).
