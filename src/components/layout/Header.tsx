import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function Header() {
  return (
    <header className="mx-auto w-full max-w-[1200px] pt-6">
      <div className="mx-auto flex h-[45px] w-full max-w-[1200px] items-start justify-between">
        <a
          href="/"
          className="flex h-9 w-40 items-center text-sm font-bold tracking-wider text-foreground"
        >
          KURIO
        </a>

        <nav className="flex items-start gap-10">
          <a
            href="/"
            className="flex w-14 flex-col gap-6 text-base font-bold text-accent"
          >
            <span>Início</span>
            <span className="h-[3px] w-full bg-primary" />
          </a>

          <a
            href="#mercado"
            className="text-base font-normal text-foreground"
          >
            Mercado
          </a>

          <a
            href="#criadores"
            className="text-base font-normal text-foreground"
          >
            Criadores
          </a>

          <a
            href="#aprenda"
            className="text-base font-normal text-foreground"
          >
            Aprenda
          </a>
        </nav>

        <div className="flex items-center gap-7">
          <button
            type="button"
            aria-label="Buscar"
            className="flex size-5 items-center justify-center"
          >
            <img
              src="public\assets\icons\Search Icon.svg"
              alt=""
              aria-hidden="true"
              className="size-5"
            />
          </button>

          <button
            type="button"
            aria-label="Abrir carrinho"
            className="relative flex size-6 items-center justify-center"
          >
            <img
              src="public\assets\icons\Cart Icon.svg"
              alt=""
              aria-hidden="true"
              className="size-6"
            />

            <Badge className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full border-2 border-background bg-primary p-0 text-[10px] font-medium text-primary-foreground">
              6
            </Badge>
          </button>

          <Button className="h-9 w-24 rounded-md bg-primary px-4 text-base font-medium text-primary-foreground hover:bg-primary">
            <img
              src="public\assets\icons\curved\Logout.svg"
              alt=""
              aria-hidden="true"
              className="size-5"
            />
            Entrar
          </Button>
        </div>
      </div>

      <div className="h-px w-full bg-primary" />
    </header>
  )
}

export default Header