
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"

const benefits = [
  {
    letter: "W",
    title: "Segurança da carteira",
    description:
      "Proteja sua carteira e colecione arte digital verificada com confiança.",
  },
  {
    letter: "C",
    title: "Criadores em destaque",
    description:
      "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
  },
  {
    letter: "D",
    title: "Alertas de lançamentos",
    description:
      "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
  },
]

const footerColumns = [
  {
    title: "Meu perfil",
    links: [
      "Meu perfil",
      "Minha coleção",
      "Atividade",
      "Estúdio do criador",
      "Lista de interesse",
    ],
  },
  {
    title: "Central de ajuda",
    links: [
      "Central de ajuda",
      "Como comprar NFTs",
      "Carteira e segurança",
      "Política do mercado",
      "Denunciar item",
    ],
  },
  {
    title: "Coleções",
    links: [
      "Arte digital",
      "Fotografia",
      "Música",
      "Arte 3D",
      "Utilidade",
    ],
  },
]

const socialNetworks = [
  {
    name: "Facebook",
    image: "/assets/icons/socials/Facebook.svg",
    url: "https://www.facebook.com/",
  },
  {
    name: "Instagram",
    image: "/assets/icons/socials/Instagram.svg",
    url: "https://www.instagram.com/",
  },
  {
    name: "Twitter",
    image: "/assets/icons/socials/Twitter.svg",
    url: "https://twitter.com/",
  },
  {
    name: "LinkedIn",
    image: "/assets/icons/socials/Linkedin.svg",
    url: "https://www.linkedin.com/",
  },
  {
    name: "YouTube",
    image: "/assets/icons/socials/Union.svg",
    url: "https://www.youtube.com/",
  },
]

function Footer() {
  const [newsletterMessage, setNewsletterMessage] = useState("")

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewsletterMessage(
      "A inscrição na newsletter ainda não está disponível nesta versão.",
    )
  }

  return (
    <footer className="mx-auto mt-24 w-full max-w-[1200px]">
      {/* Benefícios e newsletter */}
      <section className="grid grid-cols-1 gap-8 bg-surface-card p-8 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.15fr] xl:gap-0">
        {benefits.map((benefit, index) => (
          <article
            key={benefit.title}
            className={`px-4 ${
              index < benefits.length - 1
                ? "xl:border-r xl:border-primary"
                : ""
            }`}
          >
            <div className="mb-3 flex size-20 items-center justify-center rounded-[37px] bg-primary text-2xl font-bold text-ink">
              {benefit.letter}
            </div>

            <h2 className="mb-3 text-base font-bold leading-4 text-foreground">
              {benefit.title}
            </h2>

            <p className="max-w-52 text-sm leading-5 text-text-secondary">
              {benefit.description}
            </p>
          </article>
        ))}

        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-lg font-bold leading-5 text-foreground">
            Antecipe-se ao próximo lançamento
          </h2>

          <form
            onSubmit={handleNewsletterSubmit}
            className="flex h-10 w-full"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="digite seu e-mail..."
              aria-label="Seu e-mail para a newsletter"
              className="min-w-0 flex-1 rounded-l-md bg-surface-dark px-3 text-sm text-foreground placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-primary"
            />

            <Button
              type="submit"
              className="h-10 rounded-l-none rounded-r-md bg-primary px-4 text-lg font-bold text-ink hover:bg-primary-dark"
            >
              Enviar
            </Button>
          </form>

          <p aria-live="polite" className="text-xs leading-5 text-text-secondary">
            {newsletterMessage ||
              "Receba lançamentos selecionados, histórias de criadores e novidades do mercado."}
          </p>
        </section>
      </section>

      {/* Faixa institucional */}
      <section className="grid grid-cols-1 gap-5 bg-surface-dark px-8 py-6 md:grid-cols-2 xl:grid-cols-4 xl:items-center">
        <a
          href="/"
          className="text-sm font-bold tracking-wider text-foreground"
        >
          KURIO
        </a>

        <p className="text-sm leading-5 text-foreground">
          Feito para colecionadores,
          <br />
          criadores e cultura
        </p>

        <a
          href="mailto:contato@email.com"
          className="text-sm leading-5 text-foreground"
        >
          contato@email.com
        </a>

        <a
          href="tel:+551140028922"
          className="text-sm leading-5 text-foreground"
        >
          +55 11 4002 8922
        </a>
      </section>

      {/* Redes sociais */}
      <section className="grid grid-cols-1 gap-8 bg-surface-card p-8 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_224px]">
        {footerColumns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="mb-3 text-lg font-bold leading-5 text-foreground">
              {column.title}
            </h2>

            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link}>
                  <span className="text-sm leading-5 text-foreground">
                    {link}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-4 text-lg font-bold leading-5 text-foreground">
              Redes sociais
            </h2>

            <div className="flex items-center gap-2">
              {socialNetworks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="flex size-7 items-center justify-center rounded-sm border border-primary"
                >
                  <img
                    src={social.image}
                    alt=""
                    aria-hidden="true"
                    className="size-4 object-contain"
                  />
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold leading-5 text-foreground">
              Carteiras compatíveis
            </h2>

            <div className="flex min-h-6 items-center justify-center rounded-md border border-border bg-surface-dark px-2 py-1">
              <p className="text-center text-[9px] font-bold tracking-tight text-text-accent">
                METAMASK · WALLETCONNECT · COINBASE
              </p>
            </div>
          </section>
        </div>
      </section>

      {/* Copyright */}
      <div className="px-2 pt-1 pb-6 text-center text-sm leading-8 text-foreground">
        © 2026 Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}

export default Footer
