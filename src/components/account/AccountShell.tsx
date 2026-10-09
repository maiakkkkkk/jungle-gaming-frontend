import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { CircleUserRound, CreditCard, LogOut, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/useAuth'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type AccountSection = 'profile' | 'wallets'

const accountLinks = [
  { id: 'profile' as const, label: 'Dados do perfil', to: '/profile', icon: CircleUserRound },
  { id: 'wallets' as const, label: 'Carteiras', to: '/wallets', icon: CreditCard },
]

export function AccountShell({
  active,
  children,
}: {
  active: AccountSection
  children: ReactNode
}) {
  const { user, isLoading, openAuth, logout } = useAuth()

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-0 lg:py-14">
        {isLoading ? (
          <p role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-text-secondary">
            <LockKeyhole className="size-4 animate-pulse" aria-hidden="true" /> Verificando sessão…
          </p>
        ) : !user ? (
          <section className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-lg bg-surface-card px-6 py-12 text-center">
            <LockKeyhole className="size-8 text-text-accent" aria-hidden="true" />
            <h1 className="text-xl font-bold">Entre para acessar sua conta</h1>
            <p className="text-sm leading-6 text-text-secondary">
              Seu perfil e suas carteiras ficam disponíveis somente para você. Depois de entrar, esta página será mantida como destino.
            </p>
            <Button type="button" disabled={isLoading} onClick={() => openAuth('login')}>
              Entrar
            </Button>
          </section>
        ) : (
          <div className="grid min-w-0 gap-6 md:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
            <aside className="h-fit min-w-0 rounded-md bg-surface-card py-3">
              <h2 className="px-4 pb-2 text-lg font-bold">Meu perfil</h2>
              <nav aria-label="Navegação da conta" className="flex w-full min-w-0 flex-col">
                {accountLinks.map(({ id, label, to, icon: Icon }) => (
                  <Link
                    key={id}
                    to={to}
                    aria-current={active === id ? 'page' : undefined}
                    className={`flex w-full min-w-0 items-center gap-3 border-l-[5px] px-3 py-3 text-sm transition-colors md:px-4 ${
                      active === id
                        ? 'border-primary bg-surface-raised font-bold text-text-accent md:bg-transparent'
                        : 'border-transparent text-foreground hover:bg-surface-raised'
                    }`}
                  >
                    <Icon size={17} aria-hidden="true" />
                    {label}
                  </Link>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void logout()}
                  className="w-full justify-start gap-3 rounded-none border-t border-border px-4 py-3 text-sm text-text-accent md:mt-2"
                >
                  <LogOut size={17} aria-hidden="true" />
                  Sair
                </Button>
              </nav>
            </aside>
            <div className="min-w-0">{children}</div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
