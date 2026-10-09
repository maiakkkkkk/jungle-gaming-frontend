import { http, HttpResponse } from 'msw'

type MockAccount = {
  id: string
  username: string
  displayName: string
  email: string
  passwordSalt: string
  passwordHash: string
}

type MockSession = {
  accessToken: string
  userId: string
  expiresAt: number
}

const ACCOUNTS_KEY = 'kurio:mock:accounts:v1'
const SESSIONS_KEY = 'kurio:mock:sessions:v1'
const EXPIRE_NEXT_SESSION_KEY = 'kurio:mock:expire-next-session'
const PROFILE_DETAILS_KEY = 'kurio:mock:collector-profile:v1'
const WALLETS_KEY = 'kurio:mock:wallets:v1'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000
const PASSWORD_HASH_ITERATIONS = 100_000

type ProfileDetails = Record<string, { ensName: string; walletNickname: string; avatarId: string | null }>
type MockWallet = {
  displayName: string
  nickname: string
  network: 'Ethereum' | 'Polygon' | 'Solana'
  address: string
  type: 'software' | 'hardware' | 'custodial'
  ensName: string
}
type MockWallets = {
  primary: MockWallet | null
  secondary: MockWallet | null
  secondaryUsesPrimary: boolean
}

const demoAccounts: MockAccount[] = [
  {
    id: 'user-ana',
    username: 'ana.kurio',
    displayName: 'Ana Kurio',
    email: 'ana@kurio.test',
    passwordSalt: 'kurio-demo-ana-v1',
    passwordHash: '1a68f4219491467cf490b03b659f5ca8c0a6dd4974f97c710b522f5c1965bec6',
  },
  {
    id: 'user-leo',
    username: 'leo.kurio',
    displayName: 'Leo Kurio',
    email: 'leo@kurio.test',
    passwordSalt: 'kurio-demo-leo-v1',
    passwordHash: 'c0df2ef74f55738ce188f4ea22d43852370b23438ee98aafb79c1407953ab7f1',
  },
]

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

function readAccounts() {
  const accounts = readStorage<MockAccount[] | null>(ACCOUNTS_KEY, null)
  if (accounts) return accounts

  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(demoAccounts))
  return demoAccounts
}

function readSessions() {
  return readStorage<MockSession[]>(SESSIONS_KEY, [])
}

function publicAccount(account: MockAccount) {
  return {
    id: account.id,
    username: account.username,
    displayName: account.displayName,
    email: account.email,
  }
}

async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: PASSWORD_HASH_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256,
  )

  return Array.from(new Uint8Array(bits), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

function createSession(account: MockAccount) {
  const accessToken = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const sessions = readSessions().filter((session) => session.userId !== account.id)
  sessions.push({ accessToken, userId: account.id, expiresAt })
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))

  return {
    accessToken,
    session: {
      user: publicAccount(account),
      expiresAt: new Date(expiresAt).toISOString(),
    },
  }
}

function bearerToken(request: Request) {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
}

function accountForRequest(request: Request) {
  const token = bearerToken(request)
  const session = readSessions().find((item) => item.accessToken === token)
  if (!session || session.expiresAt <= Date.now()) return null
  return readAccounts().find((item) => item.id === session.userId) ?? null
}

function profileDetails() {
  return readStorage<ProfileDetails>(PROFILE_DETAILS_KEY, {})
}

function walletAccounts() {
  return readStorage<Record<string, MockWallets>>(WALLETS_KEY, {})
}

function defaultWallets(): MockWallets {
  return { primary: null, secondary: null, secondaryUsesPrimary: false }
}

function validateWallet(wallet: MockWallet | null, fieldPrefix: string) {
  const errors: Record<string, string> = {}
  if (!wallet) return errors
  if (!wallet.displayName.trim()) errors[`${fieldPrefix}.displayName`] = 'Informe um nome para a carteira.'
  if (!wallet.nickname.trim()) errors[`${fieldPrefix}.nickname`] = 'Informe um apelido.'
  if (!wallet.address.trim()) errors[`${fieldPrefix}.address`] = 'Informe o endereço da carteira.'
  else if (
    (wallet.network === 'Ethereum' || wallet.network === 'Polygon') &&
    !/^0x[a-f\d]{40}$/i.test(wallet.address.trim())
  ) errors[`${fieldPrefix}.address`] = 'Informe um endereço EVM válido com 0x e 40 caracteres hexadecimais.'
  else if (wallet.network === 'Solana' && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet.address.trim())) {
    errors[`${fieldPrefix}.address`] = 'Informe um endereço Solana válido.'
  }
  if (wallet.ensName && !/^[a-z0-9-]+\.eth$/i.test(wallet.ensName.trim())) {
    errors[`${fieldPrefix}.ensName`] = 'Informe um nome ENS terminado em .eth ou deixe o campo vazio.'
  }
  return errors
}

function invalidSession() {
  return HttpResponse.json(
    { code: 'SESSION_EXPIRED', message: 'Sua sessão expirou. Entre novamente.' },
    { status: 401 },
  )
}

export const authHandlers = [
  http.post('/api/accounts', async ({ request }) => {
    const body = (await request.json()) as {
      username?: string
      email?: string
      password?: string
    }
    const username = body.username?.trim() ?? ''
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''
    const fieldErrors: Record<string, string> = {}

    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) {
      fieldErrors.username = 'Use de 3 a 24 letras, números, ponto, hífen ou sublinhado.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = 'Informe um e-mail válido.'
    }
    if (password.length < 8) {
      fieldErrors.password = 'A senha deve ter pelo menos 8 caracteres.'
    }

    if (Object.keys(fieldErrors).length > 0) {
      return HttpResponse.json(
        { code: 'VALIDATION_ERROR', message: 'Confira os campos informados.', fieldErrors },
        { status: 422 },
      )
    }

    const accounts = readAccounts()
    const conflict = accounts.some(
      (account) =>
        account.email.toLowerCase() === email ||
        account.username.toLowerCase() === username.toLowerCase(),
    )

    if (conflict) {
      return HttpResponse.json(
        {
          code: 'ACCOUNT_CONFLICT',
          message: 'Este e-mail ou nome de usuário já está cadastrado.',
          fieldErrors: {
            email: accounts.some((account) => account.email.toLowerCase() === email)
              ? 'Este e-mail já está cadastrado.'
              : undefined,
            username: accounts.some(
              (account) => account.username.toLowerCase() === username.toLowerCase(),
            )
              ? 'Este nome de usuário já está em uso.'
              : undefined,
          },
        },
        { status: 409 },
      )
    }

    const passwordSalt = crypto.randomUUID()
    const account: MockAccount = {
      id: crypto.randomUUID(),
      username,
      displayName: username,
      email,
      passwordSalt,
      passwordHash: await hashPassword(password, passwordSalt),
    }

    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]))
    return HttpResponse.json(publicAccount(account), { status: 201 })
  }),

  http.post('/api/session', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase() ?? ''
    const password = body.password ?? ''
    const account = readAccounts().find((item) => item.email.toLowerCase() === email)

    if (!account || (await hashPassword(password, account.passwordSalt)) !== account.passwordHash) {
      return HttpResponse.json(
        { code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos.' },
        { status: 401 },
      )
    }

    return HttpResponse.json(createSession(account))
  }),

  http.get('/api/session', ({ request }) => {
    const token = bearerToken(request)
    if (!token) return HttpResponse.json(null)

    if (window.localStorage.getItem(EXPIRE_NEXT_SESSION_KEY) === 'true') {
      window.localStorage.removeItem(EXPIRE_NEXT_SESSION_KEY)
      return invalidSession()
    }

    const sessions = readSessions()
    const session = sessions.find((item) => item.accessToken === token)

    if (!session || session.expiresAt <= Date.now()) {
      window.localStorage.setItem(
        SESSIONS_KEY,
        JSON.stringify(sessions.filter((item) => item.accessToken !== token)),
      )
      return invalidSession()
    }

    const account = readAccounts().find((item) => item.id === session.userId)
    if (!account) return invalidSession()

    return HttpResponse.json({
      user: publicAccount(account),
      expiresAt: new Date(session.expiresAt).toISOString(),
    })
  }),

  http.delete('/api/session', ({ request }) => {
    const token = bearerToken(request)
    const sessions = readSessions().filter((item) => item.accessToken !== token)
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/profile', ({ request }) => {
    const account = accountForRequest(request)
    if (!account) return invalidSession()
    const details = profileDetails()[account.id] ?? {
      ensName: '',
      walletNickname: '',
      avatarId: null,
    }
    return HttpResponse.json({ ...publicAccount(account), ...details })
  }),

  http.put('/api/profile', async ({ request }) => {
    const account = accountForRequest(request)
    if (!account) return invalidSession()
    const body = (await request.json()) as {
      username?: string
      displayName?: string
      email?: string
      ensName?: string
      walletNickname?: string
      avatarId?: string | null
    }
    const username = body.username?.trim() ?? ''
    const displayName = body.displayName?.trim() ?? ''
    const email = body.email?.trim().toLowerCase() ?? ''
    const ensName = body.ensName?.trim() ?? ''
    const walletNickname = body.walletNickname?.trim() ?? ''
    const fieldErrors: Record<string, string> = {}

    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(username)) fieldErrors.username = 'Use de 3 a 24 letras, números, ponto, hífen ou sublinhado.'
    if (!displayName || displayName.length > 48) fieldErrors.displayName = 'Informe um nome com até 48 caracteres.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Informe um e-mail válido.'
    if (ensName && !/^[a-z0-9-]+\.eth$/i.test(ensName)) fieldErrors.ensName = 'Informe um nome ENS terminado em .eth ou deixe o campo vazio.'
    if (walletNickname.length > 32) fieldErrors.walletNickname = 'Use no máximo 32 caracteres.'
    const validAvatars = new Set(['ape-03', 'ape-04', 'ape-05'])
    if (body.avatarId !== null && body.avatarId !== undefined && !validAvatars.has(body.avatarId)) {
      fieldErrors.avatarId = 'Selecione um avatar disponível.'
    }

    const accounts = readAccounts()
    const conflict = accounts.find((candidate) =>
      candidate.id !== account.id &&
      (candidate.email.toLowerCase() === email || candidate.username.toLowerCase() === username.toLowerCase()),
    )
    if (conflict) {
      if (conflict.email.toLowerCase() === email) fieldErrors.email = 'Este e-mail já está em uso.'
      if (conflict.username.toLowerCase() === username.toLowerCase()) fieldErrors.username = 'Este nome de usuário já está em uso.'
    }
    if (Object.keys(fieldErrors).length) {
      return HttpResponse.json(
        { code: conflict ? 'PROFILE_CONFLICT' : 'VALIDATION_ERROR', message: conflict ? 'E-mail ou nome de usuário já está em uso.' : 'Confira os campos do perfil.', fieldErrors },
        { status: conflict ? 409 : 422 },
      )
    }

    const updatedAccounts = accounts.map((candidate) => candidate.id === account.id
      ? { ...candidate, username, displayName, email }
      : candidate)
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updatedAccounts))
    const details = profileDetails()
    details[account.id] = {
      ensName,
      walletNickname,
      avatarId: body.avatarId ?? null,
    }
    window.localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(details))
    return HttpResponse.json({ id: account.id, username, displayName, email, ...details[account.id] })
  }),

  http.put('/api/profile/password', async ({ request }) => {
    const account = accountForRequest(request)
    if (!account) return invalidSession()
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string }
    const currentPassword = body.currentPassword ?? ''
    const newPassword = body.newPassword ?? ''
    if (newPassword.length < 8) {
      return HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'A nova senha precisa ter pelo menos 8 caracteres.' }, { status: 422 })
    }
    if (await hashPassword(currentPassword, account.passwordSalt) !== account.passwordHash) {
      return HttpResponse.json({ code: 'CURRENT_PASSWORD_INVALID', message: 'A senha atual está incorreta.' }, { status: 422 })
    }
    if (newPassword === currentPassword) {
      return HttpResponse.json({ code: 'PASSWORD_UNCHANGED', message: 'Escolha uma senha diferente da atual.' }, { status: 422 })
    }
    const passwordSalt = crypto.randomUUID()
    const passwordHash = await hashPassword(newPassword, passwordSalt)
    const accounts = readAccounts().map((candidate) => candidate.id === account.id
      ? { ...candidate, passwordSalt, passwordHash }
      : candidate)
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    return HttpResponse.json({ message: 'Senha alterada com sucesso.' })
  }),

  http.get('/api/wallets', ({ request }) => {
    const account = accountForRequest(request)
    if (!account) return invalidSession()
    const wallets = walletAccounts()
    return HttpResponse.json(wallets[account.id] ?? defaultWallets())
  }),

  http.put('/api/wallets', async ({ request }) => {
    const account = accountForRequest(request)
    if (!account) return invalidSession()
    const body = (await request.json()) as Partial<MockWallets>
    const primary = body.primary ?? null
    const secondary = body.secondary ?? null
    const secondaryUsesPrimary = body.secondaryUsesPrimary === true
    const fieldErrors = {
      ...validateWallet(primary, 'primary'),
      ...validateWallet(secondary, 'secondary'),
    }
    if (secondary && !primary) {
      fieldErrors['secondary.displayName'] = 'Cadastre a carteira principal primeiro.'
    }
    if (secondaryUsesPrimary && (!primary || secondary)) {
      fieldErrors['secondary.displayName'] = 'Salve a carteira principal e use a opção de reutilização.'
    }
    if (primary && secondary && primary.address.trim().toLowerCase() === secondary.address.trim().toLowerCase()) {
      fieldErrors['secondary.address'] = 'Esse endereço já está cadastrado como carteira principal.'
    }
    if (Object.keys(fieldErrors).length) {
      return HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'Confira os dados das carteiras.', fieldErrors }, { status: 422 })
    }
    const result = { primary, secondary: secondaryUsesPrimary ? null : secondary, secondaryUsesPrimary }
    const wallets = walletAccounts()
    wallets[account.id] = result
    window.localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets))
    return HttpResponse.json(result)
  }),
]
