# Contratos da conta do colecionador (MSW)

As operações usam Axios em `/api`, exigem sessão autenticada e armazenam dados pelo ID do usuário. Consultas privadas incluem o ID nas chaves TanStack Query e usam `meta.private`, então o cache participa da limpeza ao encerrar ou trocar a sessão.

| Método e rota | Uso |
| --- | --- |
| `GET /profile` | Retorna dados da conta, ENS, apelido de carteira e avatar local. |
| `PUT /profile` | Atualiza dados; retorna `422` para validação ou `409` para conflito de e-mail/nome de usuário. |
| `PUT /profile/password` | Valida senha atual e nova; salva apenas hash PBKDF2 com salt. |
| `GET /wallets` | Retorna `{ primary, secondary, secondaryUsesPrimary }` da conta atual. |
| `PUT /wallets` | Cria/atualiza as carteiras e valida rede, endereço, ENS e duplicidade. |

Carteiras são registros simulados: não há conexão com extensão, provedor ou blockchain. Avatares usam assets locais pré-selecionados; não há upload nesta versão. Os usuários de demonstração começam sem carteiras, e seus dados de conta são consultados individualmente.
