import { expect, test, type Page } from '@playwright/test'
import type { MockTestHooks } from '../src/mocks/testHooks'

// A camada de mocks expõe gatilhos determinísticos em `window.__mocks`.
declare global {
  interface Window {
    __mocks?: MockTestHooks
  }
}

const demoUser = {
  email: 'ana@kurio.test',
  password: 'KurioDemo123!',
}

async function resetApplication(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function login(page: Page) {
  await page.getByRole('button', { name: 'Entrar na conta' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#auth-email').fill(demoUser.email)
  await dialog.locator('#auth-password').fill(demoUser.password)
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible()
}

async function addEmeraldApeToCart(page: Page) {
  await page.goto('/nft/nft-03')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await page.getByRole('button', { name: 'Comprar', exact: true }).click()
  await expect(page.getByRole('link', { name: /Abrir carrinho, 1 itens/ })).toBeVisible()
}

async function saveEthereumWallet(page: Page) {
  await page.goto('/wallets')
  await page.locator('#primary-displayName').fill('Ana Kurio')
  await page.locator('#primary-nickname').fill('Carteira E2E')
  await page.locator('#primary-address').fill('0x1234567890abcdef1234567890abcdef12345678')
  await page.getByRole('button', { name: 'Salvar carteira principal' }).click()
  await expect(page.getByRole('status')).toContainText('Carteira principal salva.')
}

async function registerAccount(
  page: Page,
  account: { username: string; email: string; password: string },
) {
  await page.getByRole('button', { name: 'Entrar na conta' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: 'Criar conta' }).first().click()
  await dialog.locator('#auth-username').fill(account.username)
  await dialog.locator('#auth-email').fill(account.email)
  await dialog.locator('#auth-password').fill(account.password)
  await dialog.locator('#auth-confirmPassword').fill(account.password)
  await dialog.getByRole('button', { name: 'Criar conta', exact: true }).last().click()
  await expect(
    page.getByText('Cadastro concluído. Entre com os dados da sua conta.'),
  ).toBeVisible()
  await dialog.locator('#auth-email').fill(account.email)
  await dialog.locator('#auth-password').fill(account.password)
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await resetApplication(page)
})

test('autentica com a conta de demonstração e encerra a sessão', async ({ page }) => {
  await login(page)
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('button', { name: 'Entrar na conta' })).toBeVisible()
})

test('favorita um NFT e mantém a alteração do carrinho após atualizar', async ({ page }) => {
  await login(page)
  await page.goto('/nft/nft-03')
  const favoriteButton = page.getByRole('button', { name: /Favoritar/ })
  await favoriteButton.click()
  await expect(page.getByRole('button', { name: /Favoritado/ })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Comprar', exact: true }).click()
  await page.getByRole('link', { name: /Abrir carrinho, 1 itens/ }).click()
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible()
  await page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' }).click()
  const cartItems = page.getByRole('region', { name: 'Itens do carrinho' })
  await expect(cartItems.getByText('2', { exact: true })).toBeVisible()
  await page.reload()
  await expect(cartItems.getByText('2', { exact: true })).toBeVisible()
})

test('confirma compra e recupera o recibo após atualizar', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await page.getByLabel('WalletConnect').check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/order\/ord_/)
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
  await expect(page.getByText('Emerald Ape #042')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toBeVisible()
})

test('não exibe recibo para pedido inexistente e não gera overflow em mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await page.goto('/order/not-real')
  await expect(page.getByRole('heading', { name: 'Pedido indisponível' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' })).toHaveCount(0)
  await expect(page.evaluate(() => document.documentElement.scrollWidth)).resolves.toBeLessThanOrEqual(390)
})

test('recebe atualização de preço em tempo real e bloqueia a confirmação com cotação desatualizada', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  // Torna determinística a janela em que a cotação permanece desatualizada.
  await page.evaluate(() => window.__mocks?.setSlowQuote(true))
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await expect(page.getByText('1.19 ETH').first()).toBeVisible()
  await page.getByLabel('WalletConnect').check()

  // Alteração de preço disparada no servidor simulado: o evento percorre o
  // mesmo caminho de produção (MSW → socket.io-client → sincronização).
  await expect(
    page.evaluate(() => window.__mocks?.updateNftPrice('nft-03', '1.99', '1.19')),
  ).resolves.toBe(true)

  // Reação em tempo real: aviso exibido e confirmação bloqueada até reconciliar.
  await expect(
    page.getByText('Alteração de preço/estoque recebida em tempo real'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Atualizando cotação…' })).toBeDisabled()

  // Cotação reconciliada pela API REST: novo preço exibido e confirmação liberada.
  await page.evaluate(() => window.__mocks?.setSlowQuote(false))
  await expect(page.getByText('1.99 ETH').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled()
})

test('recupera pedido pendente após recarregar e conclui sem criar outra compra', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  // Cenário: pedido criado como pendente e liquidação manual (controlada pelo teste).
  await page.evaluate(() => {
    window.__mocks?.setPendingPayment(true)
    window.__mocks?.setManualSettlement(true)
  })
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await page.getByLabel('WalletConnect').check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  await expect(page).toHaveURL(/\/order\/ord_/)
  const orderId = /order\/(ord_[a-z0-9-]+)/.exec(page.url())?.[1]
  expect(orderId, 'pedido criado').toBeTruthy()
  await expect(
    page.getByRole('heading', { name: 'Pagamento em processamento' }),
  ).toBeVisible()

  // Recarga no meio do pagamento: o mesmo pedido é retomado, sem nova compra.
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Pagamento em processamento' }),
  ).toBeVisible()

  // Volta ao pagamento: banner de retomada e confirmação bloqueada enquanto pendente.
  await page.goto('/payment')
  await expect(page.getByText('Você tem um pedido pendente')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()

  // Liquidação via order.updated em tempo real → recibo do MESMO pedido.
  await expect(
    page.evaluate((id) => window.__mocks?.settleOrder(id!, 'confirmed'), orderId),
  ).resolves.toBe(true)
  await expect(page).toHaveURL(new RegExp(`/order/${orderId}$`))
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible()

  // Nenhuma compra duplicada: a tentativa local foi liberada e o pedido é único.
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible()
  await expect(
    page.evaluate(() => window.localStorage.getItem('kurio:pending-order')),
  ).resolves.toBeNull()
})

test('filtra o catálogo, pagina e restaura o estado pelo histórico', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toBeVisible()

  // Paginação: 12 NFTs em páginas de 9.
  await page.getByRole('button', { name: '2', exact: true }).click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.getByRole('link', { name: 'Digital Horizon #016' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toHaveCount(0)

  // Restauração pelo histórico: voltar repõe a página anterior.
  await page.goBack()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toBeVisible()

  // Filtros combinados: coleção e rede.
  await page.getByRole('button', { name: /Jogos/ }).click()
  await expect(page).toHaveURL(/collection=Jogos/)
  await expect(page.getByRole('link', { name: 'Golden Beat #207' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Solar Relic #018' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toHaveCount(0)
  await page.getByRole('button', { name: /Solana/ }).click()
  await expect(page).toHaveURL(/network=Solana/)
  await expect(page.getByRole('link', { name: 'Golden Beat #207' })).toBeVisible()

  // Faixa de preço combinada com coleção e rede. O setter nativo contorna o
  // rastreador de valor do React, garantindo que o onChange real dispare.
  await page.getByLabel('Preço máximo').evaluate((element) => {
    const input = element as HTMLInputElement
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setValue?.call(input, '1')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page).toHaveURL(/maxPrice=1(?!\d)/)
  await expect(page.getByRole('link', { name: 'Golden Beat #207' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Solar Relic #018' })).toHaveCount(0)

  // O histórico desfaz o último filtro.
  await page.goBack()
  await expect(page.getByRole('link', { name: 'Solar Relic #018' })).toBeVisible()
  await expect(page).not.toHaveURL(/maxPrice/)

  // Aba sem resultados exibe o estado vazio dedicado.
  await page.getByRole('button', { name: 'Em alta' }).click()
  await expect(page.getByText('Ainda não há dados de NFTs em alta.')).toBeVisible()
})

test('trata acesso direto a um NFT inexistente', async ({ page }) => {
  await page.goto('/nft/nao-existe')
  await expect(page.getByRole('heading', { name: 'NFT não encontrado' })).toBeVisible()
  await expect(
    page.getByText('Esse item não existe ou não está mais disponível.'),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Voltar ao mercado' }).click()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toBeVisible()
})

test('ignora eventos duplicados e antigos sem regredir o catálogo', async ({ page }) => {
  await page.goto('/')
  const emerald = page.getByRole('link', { name: 'Emerald Ape #042' })
  await expect(emerald.getByText('1.19 ETH')).toBeVisible()

  // Duplicado: a mesma versão reemitida não altera o estado.
  await expect(
    page.evaluate(() => window.__mocks?.emitNftUpdatedEvent('nft-03')),
  ).resolves.toBe(true)
  await expect(emerald.getByText('1.19 ETH')).toBeVisible()

  // Antigo: versão menor tentando regredir o preço é descartada.
  await expect(
    page.evaluate(() =>
      window.__mocks?.emitNftUpdatedEvent('nft-03', { version: 0, price: '0.01' }),
    ),
  ).resolves.toBe(true)
  await expect(emerald.getByText('1.19 ETH')).toBeVisible()
  await expect(page.getByText('0.01 ETH')).toHaveCount(0)
})

test('reconcilia o catálogo com a API REST após desconexão e reconexão', async ({ page }) => {
  await page.goto('/')
  const neon = page.getByRole('link', { name: 'Neon Vessel #552' })
  await expect(neon.getByText('1.99 ETH')).toBeVisible()

  // Desconectado: o evento emitido não chega e o catálogo permanece estável.
  await page.evaluate(() => window.__mocks?.setSocketConnected(false))
  await expect(
    page.evaluate(() => window.__mocks?.updateNftPrice('nft-05', '2.50')),
  ).resolves.toBe(true)
  await expect(neon.getByText('1.99 ETH')).toBeVisible()
  await expect(neon.getByText('2.50 ETH')).toHaveCount(0)

  // Reconexão: o 'connect' dispara a reconciliação com a API REST.
  await page.evaluate(() => window.__mocks?.setSocketConnected(true))
  await expect(neon.getByText('2.50 ETH')).toBeVisible()
  await expect(neon.getByText('1.99 ETH')).toHaveCount(0)
})

test('recusa o pagamento preservando o carrinho e permite nova tentativa', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await page.getByRole('radio', { name: 'Recusar pagamento' }).check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  // Recusa: sem navegação, motivo exibido e carrinho preservado.
  await expect(page).toHaveURL(/\/payment/)
  await expect(page.getByRole('alert')).toContainText(
    'A simulação de pagamento foi recusada pelo provedor.',
  )
  await expect(
    page.evaluate(() => window.localStorage.getItem('kurio:pending-order')),
  ).resolves.toBeNull()
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()

  // Nova tentativa com provedor válido confirma a compra e esvazia o carrinho.
  await page.goto('/payment')
  await page.getByRole('radio', { name: 'WalletConnect' }).check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/order\/ord_/)
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible()
  await page.goto('/cart')
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
})

test('clique repetido na confirmação cria um único pedido', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  // Janela determinística: a primeira confirmação permanece em andamento o
  // suficiente para o segundo clique encontrar o botão desabilitado.
  await page.evaluate(() => window.__mocks?.setSlowOrder(true))
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await page.getByLabel('WalletConnect').check()

  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  const confirming = page.getByRole('button', { name: 'Confirmando…' })
  await expect(confirming).toBeDisabled()
  await confirming.click({ force: true })

  await expect(page).toHaveURL(/\/order\/ord_/)
  await page.evaluate(() => window.__mocks?.setSlowOrder(false))
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toBeVisible()
  const orderCount = await page.evaluate(() =>
    Object.keys(JSON.parse(window.localStorage.getItem('kurio:mock:orders:v1') ?? '{}')).length,
  )
  expect(orderCount).toBe(1)
})

test('aplica cupom, rejeita código inválido e preserva após atualizar', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await page.goto('/cart')
  const couponInput = page.locator('#cart-coupon')

  await couponInput.fill('INVALIDO')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByRole('alert')).toContainText('Cupom inválido')

  await couponInput.fill('KURIO10')
  await page.getByRole('button', { name: 'Aplicar' }).click()
  await expect(page.getByText('KURIO10', { exact: true })).toBeVisible()
  await expect(page.getByText('Desconto do cupom')).toBeVisible()

  // Persistência do cupom após recarregar.
  await page.reload()
  await expect(page.getByText('KURIO10', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Remover cupom' }).click()
  await expect(page.getByText('KURIO10')).toHaveCount(0)
  await expect(couponInput).toBeVisible()
})

test('isola pedidos entre usuários e expira a sessão', async ({ page }) => {
  await login(page)
  await addEmeraldApeToCart(page)
  await saveEthereumWallet(page)
  await page.evaluate(() => {
    window.__mocks?.setPendingPayment(true)
    window.__mocks?.setManualSettlement(true)
  })
  await page.goto('/payment')
  await expect(page.getByRole('heading', { name: 'Pagamento com carteira' })).toBeVisible()
  await page.getByLabel('WalletConnect').check()
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await expect(page).toHaveURL(/\/order\/ord_/)
  const orderId = /order\/(ord_[a-z0-9-]+)/.exec(page.url())?.[1]
  expect(orderId, 'pedido criado').toBeTruthy()

  // Cadastro e troca de usuário no mesmo contexto (estado do servidor compartilhado).
  await page.getByRole('button', { name: 'Sair da conta' }).click()
  await expect(page.getByRole('button', { name: 'Entrar na conta' })).toBeVisible()
  await registerAccount(page, {
    username: 'e2e.colecao',
    email: 'e2e@kurio.test',
    password: 'E2eKurio123!',
  })

  // O pedido de Ana existe no servidor, mas outro usuário não consegue lê-lo.
  await page.goto(`/order/${orderId}`)
  await expect(page.getByRole('heading', { name: 'Pedido indisponível' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Seus NFTs agora estão na sua carteira' }),
  ).toHaveCount(0)

  // Expiração de sessão: a próxima leitura falha e a interface reage.
  await page.evaluate(() =>
    window.localStorage.setItem('kurio:mock:expire-next-session', 'true'),
  )
  await page.reload()
  await expect(
    page.getByText('Sua sessão expirou. Entre novamente para continuar.'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toHaveCount(0)
})

test('valida o formulário de login e o foco do diálogo', async ({ page }) => {
  await page.getByRole('button', { name: 'Entrar na conta' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  // Controle de foco: o foco inicial fica dentro do diálogo.
  await expect(
    page.evaluate(() => Boolean(document.activeElement?.closest('dialog'))),
  ).resolves.toBe(true)

  // Envio vazio: erros por campo associados aos inputs.
  await dialog.getByRole('button', { name: 'Entrar', exact: true }).last().click()
  await expect(dialog.getByText('Informe um e-mail válido.')).toBeVisible()
  await expect(dialog.getByText('Informe sua senha.')).toBeVisible()
  await expect(dialog.locator('#auth-email')).toHaveAttribute('aria-invalid', 'true')

  // Escape fecha o diálogo e devolve o foco ao gatilho.
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Entrar na conta' })).toBeFocused()
})

test('exibe skeleton durante o carregamento lento do catálogo', async ({ page }) => {
  await page.evaluate(() => window.__mocks?.setSlowCatalog(true))
  await page.reload()
  const skeleton = page.getByRole('status', { name: 'Carregando NFTs' })
  await expect(skeleton).toBeVisible()
  await expect(page.getByRole('link', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(skeleton).toBeHidden()
})

test('valida o perfil, exibe erro de campo e permite recuperação', async ({ page }) => {
  await login(page)
  await page.goto('/profile')
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()

  // Erro de validação da API: nome de usuário com caracteres inválidos.
  const usernameInput = page.locator('#profile-username')
  await usernameInput.fill('a')
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByText('Use de 3 a 24 letras, números, ponto, hífen ou sublinhado.')).toBeVisible()
  await expect(usernameInput).toHaveAttribute('aria-invalid', 'true')

  // Recuperação: corrigir o campo e salvar com sucesso.
  await usernameInput.fill('ana.kurio')
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page.getByText('Dados do perfil salvos.')).toBeVisible()
  await expect(usernameInput).toHaveAttribute('aria-invalid', 'false')
})
