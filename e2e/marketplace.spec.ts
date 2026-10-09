import { expect, test, type Page } from '@playwright/test'

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
