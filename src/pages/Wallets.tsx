import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Check, LoaderCircle, Plus, WalletCards } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountShell } from '@/components/account/AccountShell'
import { useAuth } from '@/components/auth/useAuth'
import { useCollectorWallets } from '@/hooks/useCollector'
import type { CollectorApiError, CollectorWallet, CollectorWallets } from '@/services/collector'

const emptyWallet: CollectorWallet = {
  displayName: '',
  nickname: '',
  network: 'Ethereum',
  address: '',
  type: 'software',
  ensName: '',
}

function WalletFields({
  prefix,
  value,
  errors,
  onChange,
}: {
  prefix: 'primary' | 'secondary'
  value: CollectorWallet
  errors: Record<string, string>
  onChange: (name: keyof CollectorWallet, value: string) => void
}) {
  const fields: { name: keyof CollectorWallet; label: string; placeholder?: string }[] = [
    { name: 'displayName', label: 'Nome de exibição' },
    { name: 'nickname', label: 'Apelido da carteira' },
    { name: 'address', label: 'Endereço da carteira', placeholder: '0x… ou endereço da rede' },
    { name: 'ensName', label: 'Nome ENS', placeholder: 'nome.eth (opcional)' },
  ]

  return (
    <div className="grid min-w-0 gap-5 sm:grid-cols-2">
      {fields.slice(0, 2).map((field) => {
        const error = errors[`${prefix}.${field.name}`]
        return (
          <div key={field.name} className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${prefix}-${field.name}`} className="text-sm">{field.label} <span className="text-destructive">*</span></label>
            <input id={`${prefix}-${field.name}`} required value={value[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? `${prefix}-${field.name}-error` : undefined} onChange={(event) => onChange(field.name, event.currentTarget.value)} className="h-10 min-w-0 rounded-[3px] border border-border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            {error && <p id={`${prefix}-${field.name}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
          </div>
        )
      })}
      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={`${prefix}-network`} className="text-sm">Rede <span className="text-destructive">*</span></label>
        <select id={`${prefix}-network`} required value={value.network} onChange={(event) => onChange('network', event.currentTarget.value)} className="h-10 min-w-0 rounded-[3px] border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="Ethereum">Ethereum</option>
          <option value="Polygon">Polygon</option>
          <option value="Solana">Solana</option>
        </select>
      </div>
      {fields.slice(2).map((field) => {
        const error = errors[`${prefix}.${field.name}`]
        return (
          <div key={field.name} className="flex min-w-0 flex-col gap-2">
            <label htmlFor={`${prefix}-${field.name}`} className="text-sm">{field.label}{field.name === 'address' && <span className="text-destructive"> *</span>}</label>
            <input id={`${prefix}-${field.name}`} required={field.name === 'address'} placeholder={field.placeholder} value={value[field.name]} aria-invalid={Boolean(error)} aria-describedby={error ? `${prefix}-${field.name}-error` : undefined} onChange={(event) => onChange(field.name, event.currentTarget.value)} className="h-10 min-w-0 rounded-[3px] border border-border bg-transparent px-3 text-sm outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary" />
            {error && <p id={`${prefix}-${field.name}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
          </div>
        )
      })}
      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor={`${prefix}-type`} className="text-sm">Tipo de carteira <span className="text-destructive">*</span></label>
        <select id={`${prefix}-type`} required value={value.type} onChange={(event) => onChange('type', event.currentTarget.value)} className="h-10 min-w-0 rounded-[3px] border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <option value="software">Software</option>
          <option value="hardware">Hardware</option>
          <option value="custodial">Custódia</option>
        </select>
      </div>
    </div>
  )
}

function WalletsForm() {
  const { wallets, update } = useCollectorWallets()
  const [primaryDraft, setPrimaryDraft] = useState<CollectorWallet | undefined>()
  const [secondaryDraft, setSecondaryDraft] = useState<CollectorWallet | undefined>()
  const [secondaryUsesPrimaryDraft, setSecondaryUsesPrimaryDraft] = useState<boolean | undefined>()
  const [showSecondaryDraft, setShowSecondaryDraft] = useState<boolean | undefined>()
  const primary = primaryDraft ?? wallets.data?.primary ?? emptyWallet
  const secondary = secondaryDraft ?? wallets.data?.secondary ?? emptyWallet
  const secondaryUsesPrimary = secondaryUsesPrimaryDraft ?? wallets.data?.secondaryUsesPrimary ?? false
  const showSecondary = showSecondaryDraft ?? (Boolean(wallets.data?.secondary) || (wallets.data?.secondaryUsesPrimary ?? false))
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  function changeWallet(role: 'primary' | 'secondary', name: keyof CollectorWallet, value: string) {
    const setter = role === 'primary' ? setPrimaryDraft : setSecondaryDraft
    const persisted = role === 'primary' ? wallets.data?.primary : wallets.data?.secondary
    setter((current) => ({ ...(current ?? persisted ?? emptyWallet), [name]: value }) as CollectorWallet)
    setFieldErrors((current) => ({ ...current, [`${role}.${name}`]: '' }))
    setFormError('')
    setSuccess('')
  }

  async function persist(next: CollectorWallets, message: string): Promise<boolean> {
    setFieldErrors({})
    setFormError('')
    setSuccess('')
    try {
      await update.mutateAsync(next)
      setPrimaryDraft(next.primary ?? emptyWallet)
      setSecondaryDraft(next.secondary ?? emptyWallet)
      setSecondaryUsesPrimaryDraft(next.secondaryUsesPrimary)
      setShowSecondaryDraft(Boolean(next.secondary) || next.secondaryUsesPrimary)
      setSuccess(message)
      return true
    } catch (error) {
      if (isAxiosError<CollectorApiError>(error)) {
        setFieldErrors(error.response?.data.fieldErrors ?? {})
        setFormError(error.response?.data.message ?? 'Não foi possível salvar as carteiras.')
      } else {
        setFormError('Não foi possível salvar as carteiras. Tente novamente.')
      }
      return false
    }
  }

  function savePrimary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void persist({ primary, secondary: secondaryUsesPrimary ? null : (wallets.data?.secondary ?? null), secondaryUsesPrimary }, 'Carteira principal salva.')
  }

  function saveSecondary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!wallets.data?.primary) {
      setFormError('Salve a carteira principal antes de cadastrar uma secundária.')
      return
    }
    void persist({ primary: wallets.data.primary, secondary, secondaryUsesPrimary: false }, 'Carteira secundária salva.')
  }

  async function toggleSameWallet(checked: boolean) {
    const previous = secondaryUsesPrimary
    setSecondaryUsesPrimaryDraft(checked)
    if (wallets.data?.primary) {
      const saved = await persist({ ...wallets.data, secondary: null, secondaryUsesPrimary: checked }, checked ? 'A carteira secundária usará os dados da principal.' : 'A opção de reutilização foi removida.')
      if (!saved) setSecondaryUsesPrimaryDraft(previous)
    } else {
      setShowSecondaryDraft(true)
    }
  }

  const loading = wallets.isPending

  return (
      <div className="flex flex-col gap-7">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold">Carteiras</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">Cadastre os endereços que deseja usar no marketplace. Os dados são simulados; nenhuma extensão ou rede blockchain será conectada.</p>
          </div>
          {wallets.data?.primary && !showSecondary && (
            <Button type="button" variant="outline" onClick={() => setShowSecondaryDraft(true)}><Plus className="size-4" /> Adicionar secundária</Button>
          )}
        </header>

        {loading ? (
          <p role="status" className="flex items-center gap-2 text-sm text-text-secondary"><LoaderCircle className="size-4 animate-spin" /> Carregando carteiras…</p>
        ) : wallets.isError ? (
          <section className="rounded-md bg-surface-card p-5">
            <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível carregar suas carteiras.</p>
            <Button type="button" variant="outline" onClick={() => void wallets.refetch()}>Tentar novamente</Button>
          </section>
        ) : (
          <>
            <section className="rounded-md bg-surface-card p-4 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <WalletCards className="mt-0.5 size-5 text-text-accent" aria-hidden="true" />
                <div>
                  <h2 className="font-bold">Carteira principal</h2>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">Disponível para checkout e para receber NFTs comprados.</p>
                </div>
              </div>
              <form onSubmit={savePrimary} className="flex flex-col gap-5">
                <WalletFields prefix="primary" value={primary} errors={fieldErrors} onChange={(name, value) => changeWallet('primary', name, value)} />
                <Button type="submit" disabled={update.isPending}>{update.isPending ? 'Salvando…' : 'Salvar carteira principal'}</Button>
              </form>
            </section>

            <section className="rounded-md bg-surface-card p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-bold">Carteira secundária</h2>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">Opcional. Pode ser um endereço diferente ou usar a carteira principal.</p>
                </div>
                {!showSecondary && <Button type="button" variant="outline" onClick={() => setShowSecondaryDraft(true)}><Plus className="size-4" /> Adicionar</Button>}
              </div>

              {showSecondary ? (
                <div className="flex flex-col gap-5">
                  <label className="flex items-start gap-3 text-sm leading-5">
                    <input type="checkbox" checked={secondaryUsesPrimary} disabled={!wallets.data?.primary || update.isPending} onChange={(event) => void toggleSameWallet(event.currentTarget.checked)} className="mt-0.5 size-4 accent-primary focus-visible:outline-2 focus-visible:outline-primary" />
                    <span>Usar a carteira principal como carteira secundária</span>
                  </label>
                  {!wallets.data?.primary && <p className="text-xs text-text-secondary">Cadastre a carteira principal para habilitar esta opção.</p>}
                  {!secondaryUsesPrimary && (
                    <form onSubmit={saveSecondary} className="flex flex-col gap-5">
                      <WalletFields prefix="secondary" value={secondary} errors={fieldErrors} onChange={(name, value) => changeWallet('secondary', name, value)} />
                      <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={update.isPending || !wallets.data?.primary}>{update.isPending ? 'Salvando…' : wallets.data?.secondary ? 'Salvar alterações' : 'Salvar carteira secundária'}</Button>
                        <Button type="button" variant="ghost" onClick={() => { setShowSecondaryDraft(false); setSecondaryUsesPrimaryDraft(false); setSecondaryDraft(wallets.data?.secondary ?? emptyWallet); setFormError('') }}>Cancelar</Button>
                      </div>
                    </form>
                  )}
                  {secondaryUsesPrimary && <p className="text-sm text-text-secondary">A mesma carteira será usada nas duas funções.</p>}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">Você ainda não cadastrou uma carteira secundária.</p>
              )}
            </section>

            {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            {success && <p role="status" className="flex items-center gap-2 text-sm text-text-accent"><Check className="size-4" /> {success}</p>}
          </>
        )}
      </div>
  )
}

function WalletsPage() {
  const { user } = useAuth()
  return (
    <AccountShell active="wallets">
      {user && <WalletsForm key={user.id} />}
    </AccountShell>
  )
}

export default WalletsPage
