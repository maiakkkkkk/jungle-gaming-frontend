# Cupons fictícios para teste

Estes códigos existem apenas no mock de desenvolvimento e não representam uma promoção ou política comercial real.

| Código | Resultado simulado |
| --- | --- |
| `KURIO10` | Válido; aplica 10% de desconto ao subtotal elegível da moeda correspondente. |
| `EXPIRADO10` | Expirado; a API responde `410 COUPON_EXPIRED`. |
| Qualquer outro código | Desconhecido; a API responde `422 COUPON_INVALID`. |

O desconto é calculado com aritmética decimal inteira. Taxa de rede mockada: `0.016 ETH`, conforme o valor da referência do carrinho. A cotação não converte nem soma moedas diferentes.
