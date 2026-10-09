import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Check, ImagePlus, LoaderCircle, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountShell } from '@/components/account/AccountShell'
import { useAuth } from '@/components/auth/useAuth'
import { useChangeCollectorPassword, useCollectorProfile } from '@/hooks/useCollector'
import type { CollectorApiError, CollectorProfileInput } from '@/services/collector'

const avatarChoices = [
  { id: 'ape-03', src: '/assets/images/NFT%20Artwork%2003.png', label: 'Arte de macaco' },
  { id: 'ape-04', src: '/assets/images/NFT%20Artwork%2004.png', label: 'Arte colorida' },
  { id: 'ape-05', src: '/assets/images/NFT%20Artwork%2005.png', label: 'Arte geométrica' },
]

const emptyProfile: CollectorProfileInput = {
  username: '',
  displayName: '',
  email: '',
  ensName: '',
  walletNickname: '',
  avatarId: null,
}

function toProfileInput(profile: NonNullable<ReturnType<typeof useCollectorProfile>['profile']['data']>): CollectorProfileInput {
  return {
    username: profile.username,
    displayName: profile.displayName,
    email: profile.email,
    ensName: profile.ensName,
    walletNickname: profile.walletNickname,
    avatarId: profile.avatarId,
  }
}

const profileFields = [
  { name: 'displayName', label: 'Nome de exibição', required: true },
  { name: 'username', label: 'Nome de usuário', required: true },
  { name: 'email', label: 'E-mail', required: true, type: 'email' },
  { name: 'ensName', label: 'Nome ENS', required: false, placeholder: 'exemplo.eth' },
  { name: 'walletNickname', label: 'Apelido da carteira', required: false },
] as const

function ProfileForm() {
  const { profile, update } = useCollectorProfile()
  const passwordMutation = useChangeCollectorPassword()
  const [draft, setDraft] = useState<CollectorProfileInput | null>(null)
  const fields = draft ?? (profile.data ? toProfileInput(profile.data) : emptyProfile)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [showAvatarChoices, setShowAvatarChoices] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  function updateField(name: keyof CollectorProfileInput, value: string | null) {
    setDraft((current) => ({ ...(current ?? (profile.data ? toProfileInput(profile.data) : emptyProfile)), [name]: value }))
    setFieldErrors((current) => ({ ...current, [name]: '' }))
    setFormError('')
    setProfileMessage('')
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setFormError('')
    setProfileMessage('')
    try {
      const savedProfile = await update.mutateAsync(fields)
      setDraft(toProfileInput(savedProfile))
      setProfileMessage('Dados do perfil salvos.')
    } catch (error) {
      if (isAxiosError<CollectorApiError>(error)) {
        setFieldErrors(error.response?.data.fieldErrors ?? {})
        setFormError(error.response?.data.message ?? 'Não foi possível salvar seu perfil.')
      } else {
        setFormError('Não foi possível salvar seu perfil. Tente novamente.')
      }
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')
    setPasswordMessage('')
    if (passwords.newPassword.length < 8) {
      setPasswordError('A nova senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('A confirmação não corresponde à nova senha.')
      return
    }
    try {
      const result = await passwordMutation.mutateAsync({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordMessage(result.message)
    } catch (error) {
      setPasswordError(
        isAxiosError<CollectorApiError>(error)
          ? error.response?.data.message ?? 'Não foi possível alterar a senha.'
          : 'Não foi possível alterar a senha. Tente novamente.',
      )
    }
  }

  const loading = profile.isPending

  return (
      <div className="flex flex-col gap-8">
        <h1 className="text-lg font-bold">Perfil do colecionador</h1>
        {loading ? (
          <p role="status" className="flex items-center gap-2 text-sm text-text-secondary"><LoaderCircle className="size-4 animate-spin" /> Carregando perfil…</p>
        ) : profile.isError ? (
          <section className="rounded-md bg-surface-card p-5">
            <p role="alert" className="mb-4 text-sm text-destructive">Não foi possível carregar seus dados.</p>
            <Button type="button" variant="outline" onClick={() => void profile.refetch()}>Tentar novamente</Button>
          </section>
        ) : (
          <>
            <form onSubmit={saveProfile} className="flex flex-col gap-7">
              <div className="grid min-w-0 gap-x-6 gap-y-5 sm:grid-cols-2">
                {profileFields.map((field) => (
                  <div key={field.name} className="flex min-w-0 flex-col gap-2">
                    <label htmlFor={`profile-${field.name}`} className="text-sm">
                      {field.label}{field.required && <span className="text-destructive"> *</span>}
                    </label>
                    <input
                      id={`profile-${field.name}`}
                      type={'type' in field ? field.type : 'text'}
                      required={field.required}
                      value={fields[field.name]}
                      placeholder={'placeholder' in field ? field.placeholder : undefined}
                      aria-invalid={Boolean(fieldErrors[field.name])}
                      aria-describedby={fieldErrors[field.name] ? `profile-${field.name}-error` : undefined}
                      onChange={(event) => updateField(field.name, event.currentTarget.value)}
                      className="h-10 min-w-0 rounded-[3px] border border-border bg-transparent px-3 text-sm outline-none placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    {fieldErrors[field.name] && <p id={`profile-${field.name}-error`} role="alert" className="text-xs text-destructive">{fieldErrors[field.name]}</p>}
                  </div>
                ))}
                <div className="flex flex-col gap-2 sm:row-span-2">
                  <span className="text-sm">Avatar</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised">
                      {fields.avatarId ? (
                        <img src={avatarChoices.find((choice) => choice.id === fields.avatarId)?.src} alt="Avatar selecionado" className="size-full object-cover" />
                      ) : <UserRound className="size-6 text-text-accent" aria-hidden="true" />}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setShowAvatarChoices((shown) => !shown)}><ImagePlus className="size-4" /> Alterar</Button>
                    <Button type="button" variant="ghost" onClick={() => updateField('avatarId', null)}><X className="size-4" /> Remover</Button>
                  </div>
                  {showAvatarChoices && (
                    <div role="group" aria-label="Escolha um avatar local" className="flex flex-wrap gap-2">
                      {avatarChoices.map((choice) => (
                        <button key={choice.id} type="button" aria-label={choice.label} aria-pressed={fields.avatarId === choice.id} onClick={() => { updateField('avatarId', choice.id); setShowAvatarChoices(false) }} className="size-12 overflow-hidden rounded-full border-2 border-border focus-visible:outline-2 focus-visible:outline-primary aria-pressed:border-primary">
                          <img src={choice.src} alt="" className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
              {profileMessage && <p role="status" className="flex items-center gap-2 text-sm text-text-accent"><Check className="size-4" /> {profileMessage}</p>}
              <div><Button type="submit" disabled={update.isPending}>{update.isPending ? 'Salvando…' : 'Salvar perfil'}</Button></div>
            </form>

            <section className="border-t border-border pt-7">
              <h2 className="mb-5 text-base font-medium">Alterar senha</h2>
              <form onSubmit={changePassword} className="flex max-w-[360px] flex-col gap-4">
                {([
                  ['currentPassword', 'Senha atual'],
                  ['newPassword', 'Nova senha'],
                  ['confirmPassword', 'Confirmar nova senha'],
                ] as const).map(([name, label]) => (
                  <div key={name} className="flex flex-col gap-2">
                    <label htmlFor={`password-${name}`} className="text-sm">{label}</label>
                    <input id={`password-${name}`} type="password" autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} required minLength={name === 'currentPassword' ? undefined : 8} value={passwords[name]} onChange={(event) => { const value = event.currentTarget.value; setPasswords((current) => ({ ...current, [name]: value })); setPasswordError(''); setPasswordMessage('') }} className="h-10 rounded-[3px] border border-border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                  </div>
                ))}
                {passwordError && <p role="alert" className="text-sm text-destructive">{passwordError}</p>}
                {passwordMessage && <p role="status" className="flex items-center gap-2 text-sm text-text-accent"><Check className="size-4" /> {passwordMessage}</p>}
                <div><Button type="submit" disabled={passwordMutation.isPending}>{passwordMutation.isPending ? 'Salvando…' : 'Salvar nova senha'}</Button></div>
              </form>
            </section>
          </>
        )}
      </div>
  )
}

function ProfilePage() {
  const { user } = useAuth()
  return (
    <AccountShell active="profile">
      {user && <ProfileForm key={user.id} />}
    </AccountShell>
  )
}

export default ProfilePage
