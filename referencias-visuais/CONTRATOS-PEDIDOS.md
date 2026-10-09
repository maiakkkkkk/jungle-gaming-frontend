# Contratos de pedido (MSW)

| Método e rota | Uso |
| --- | --- |
| `POST /orders` | Recebe carteira, provedor e `Idempotency-Key`. Recalcula a cotação no servidor, valida estoque e rede, e retorna o snapshot do pedido. |
| `GET /orders/:id` | Recupera apenas pedidos pertencentes à sessão atual. |

Uma mesma chave de idempotência com o mesmo conteúdo retorna o mesmo pedido; com conteúdo diferente retorna `409`. Pedidos confirmados reduzem a disponibilidade da edição e limpam o carrinho associado uma vez. Recusas, falta de carteira, conflito de estoque, cotação desatualizada e redes incompatíveis não limpam o carrinho. O provedor fictício **Recusar pagamento** permite exercitar o estado de recusa; não representa integração financeira real.
