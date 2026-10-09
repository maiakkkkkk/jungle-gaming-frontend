import { useEffect, useRef, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Eye, EyeOff, X } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  login,
  registerAccount,
  type ApiErrorResponse,
  type AuthResponse,
} from '@/services/session'

export type AuthMode = 'login' | 'register'

type AuthDialogProps = {
  mode: AuthMode
  notice: string | null
  onClose: () => void
  onModeChange: (mode: AuthMode) => void
  onAuthenticated: (response: AuthResponse) => void
  onRegistered: () => void
}

type AuthFields = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

type FieldName = keyof AuthFields

const emptyFields: AuthFields = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function AuthField({
  name,
  label,
  value,
  type = 'text',
  autoComplete,
  error,
  disabled,
  onChange,
}: {
  name: FieldName
  label: string
  value: string
  type?: 'text' | 'email' | 'password'
  autoComplete: string
  error?: string
  disabled: boolean
  onChange: (name: FieldName, value: string) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const id = `auth-${name}`
  const errorId = `${id}-error`
  const passwordField = type === 'password'

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={passwordField && showPassword ? 'text' : type}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => onChange(name, event.currentTarget.value)}
          className="h-11 w-full rounded-[5px] border border-border bg-surface-dark px-4 pr-11 text-sm text-foreground outline-none placeholder:text-text-secondary focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        />
        {passwordField && (
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function AuthDialog({
  mode,
  notice,
  onClose,
  onModeChange,
  onAuthenticated,
  onRegistered,
}: AuthDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    triggerRef.current = document.activeElement as HTMLElement | null
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      // Remover o diálogo do DOM não restaura o foco: devolvê-lo ao gatilho
      // que o abriu mantém a navegação por teclado coerente.
      triggerRef.current?.focus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="auth-dialog-title"
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className="fixed inset-0 m-0 h-dvh max-h-dvh w-full max-w-none overflow-y-auto bg-transparent p-0 text-foreground backdrop:bg-black/75 sm:m-auto sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(500px,calc(100vw-2rem))] sm:rounded-lg"
    >
      <section className="relative flex min-h-full flex-col bg-background px-7 py-10 sm:min-h-0 sm:rounded-lg sm:bg-surface-card sm:px-12 sm:py-9">
        <button
          type="button"
          aria-label="Fechar autenticação"
          onClick={onClose}
          className="absolute right-5 top-5 rounded p-1 text-text-secondary hover:text-text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex flex-col items-center gap-5 sm:mb-6">
          <span className="text-3xl font-bold tracking-[3.2px] sm:hidden">
            KURIO
          </span>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              type="button"
              aria-pressed={mode === 'login'}
              onClick={() => onModeChange('login')}
              className={`text-xl font-medium ${mode === 'login' ? 'text-text-accent' : 'text-foreground'}`}
            >
              Entrar
            </button>
            <span aria-hidden="true" className="h-6 w-px bg-border" />
            <button
              type="button"
              aria-pressed={mode === 'register'}
              onClick={() => onModeChange('register')}
              className={`text-xl font-medium ${mode === 'register' ? 'text-text-accent' : 'text-foreground'}`}
            >
              Criar conta
            </button>
          </div>

          <div className="text-center">
            <h2 id="auth-dialog-title" className="text-xl font-bold sm:sr-only">
              {mode === 'login' ? 'Entrar' : 'Criar perfil de colecionador'}
            </h2>
            <p className="text-xs text-foreground">
              {mode === 'login'
                ? 'Entre para gerenciar sua carteira, coleção e perfil de criador.'
                : 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.'}
            </p>
          </div>
        </div>

        {notice && (
          <p role="status" className="mb-4 text-sm text-text-accent">
            {notice}
          </p>
        )}

        <AuthForm
          key={mode}
          mode={mode}
          onAuthenticated={onAuthenticated}
          onRegistered={onRegistered}
          onModeChange={onModeChange}
        />
      </section>
    </dialog>
  )
}

function AuthForm({
  mode,
  onAuthenticated,
  onRegistered,
  onModeChange,
}: Pick<AuthDialogProps, 'mode' | 'onAuthenticated' | 'onRegistered' | 'onModeChange'>) {
  const [fields, setFields] = useState(emptyFields)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [requestError, setRequestError] = useState('')
  const loginMutation = useMutation({ mutationFn: login })
  const registerMutation = useMutation({ mutationFn: registerAccount })
  const isPending = loginMutation.isPending || registerMutation.isPending

  function updateField(name: FieldName, value: string) {
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setRequestError('')
  }

  function validate() {
    const nextErrors: Partial<Record<FieldName, string>> = {}

    if (mode === 'register' && !/^[a-zA-Z0-9_.-]{3,24}$/.test(fields.username.trim())) {
      nextErrors.username = 'Use de 3 a 24 letras, números, ponto, hífen ou sublinhado.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      nextErrors.email = 'Informe um e-mail válido.'
    }
    if (!fields.password) {
      nextErrors.password = 'Informe sua senha.'
    } else if (mode === 'register' && fields.password.length < 8) {
      nextErrors.password = 'A senha deve ter pelo menos 8 caracteres.'
    }
    if (mode === 'register' && fields.confirmPassword !== fields.password) {
      nextErrors.confirmPassword = 'As senhas não coincidem.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function showRequestError(error: unknown) {
    if (isAxiosError<ApiErrorResponse>(error)) {
      const response = error.response?.data
      if (response?.fieldErrors) {
        setErrors((current) => ({ ...current, ...response.fieldErrors }))
      }
      setRequestError(response?.message ?? 'Não foi possível concluir. Tente novamente.')
      return
    }

    setRequestError('Não foi possível concluir. Tente novamente.')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestError('')
    if (!validate()) return

    try {
      if (mode === 'login') {
        const response = await loginMutation.mutateAsync({
          email: fields.email.trim(),
          password: fields.password,
        })
        onAuthenticated(response)
      } else {
        await registerMutation.mutateAsync({
          username: fields.username.trim(),
          email: fields.email.trim(),
          password: fields.password,
        })
        setFields(emptyFields)
        onRegistered()
      }
    } catch (error) {
      showRequestError(error)
    }
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <AuthField
            name="username"
            label="Nome de usuário"
            value={fields.username}
            autoComplete="username"
            error={errors.username}
            disabled={isPending}
            onChange={updateField}
          />
        )}

        <AuthField
          name="email"
          label="E-mail"
          value={fields.email}
          type="email"
          autoComplete="email"
          error={errors.email}
          disabled={isPending}
          onChange={updateField}
        />

        <AuthField
          name="password"
          label="Senha"
          value={fields.password}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          error={errors.password}
          disabled={isPending}
          onChange={updateField}
        />

        {mode === 'login' ? (
          <button
            type="button"
            disabled
            className="self-end text-sm text-text-accent opacity-70"
          >
            Esqueceu a senha?
          </button>
        ) : (
          <AuthField
            name="confirmPassword"
            label="Confirmar senha"
            value={fields.confirmPassword}
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            disabled={isPending}
            onChange={updateField}
          />
        )}

        {requestError && (
          <p role="alert" className="text-sm text-destructive">
            {requestError}
          </p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-11 w-full rounded-[5px] bg-primary text-base font-bold text-ink hover:bg-primary-dark"
        >
          {isPending
            ? mode === 'login'
              ? 'Entrando…'
              : 'Criando conta…'
            : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-text-secondary">
        <span className="h-px flex-1 bg-border" />
        Ou continue com
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-3">
        <Button type="button" variant="outline" disabled className="h-10 w-full">
          Continuar com Google
        </Button>
        <Button type="button" variant="outline" disabled className="h-10 w-full">
          Continuar com Facebook
        </Button>
        <p className="text-center text-xs text-text-secondary">
          Login social indisponível nesta versão.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-text-secondary sm:hidden">
        {mode === 'login' ? 'Novo na Kurio? ' : 'Já tem uma conta? '}
        <button
          type="button"
          onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
          className="font-medium text-text-accent underline-offset-4 hover:underline"
        >
          {mode === 'login' ? 'Crie uma conta' : 'Entre'}
        </button>
      </p>

      {mode === 'register' && (
        <p className="mt-4 hidden text-center text-sm text-text-secondary sm:block">
          Já tem uma conta?{' '}
          <button
            type="button"
            onClick={() => onModeChange('login')}
            className="text-text-accent hover:underline"
          >
            Entrar
          </button>
        </p>
      )}
    </>
  )
}

export default AuthDialog
