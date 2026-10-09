
type PromoCardData = {
  title: string
  description: string
  image: string
  alt: string
  imageWidth: string
  imagePosition: string
}

const promos: PromoCardData[] = [
  {
    title: "Lançamentos gênesis\nde edição limitada",
    description:
      "Colecione edições escassas diretamente dos criadores antes da revelação pública.",
    image: "/assets/images/NFT%20Artwork%2017.png",
    alt: "NFT de uma coleção de edição limitada",
    imageWidth: "sm:w-[292px]",
    imagePosition: "-left-[5px]",
  },
  {
    title: "Arte digital selecionada\ne muito mais",
    description:
      "Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.",
    image: "/assets/images/NFT%20Artwork%2016.png",
    alt: "NFT de uma coleção de arte digital selecionada",
    imageWidth: "sm:w-[287px]",
    imagePosition: "left-[2px]",
  },
]

function PromoCard({ promo }: { promo: PromoCardData }) {
  return (
    <article className="relative h-64 min-w-0 overflow-hidden rounded-lg bg-surface-card">
      <img
        src={promo.image}
        alt={promo.alt}
        className={`absolute top-0 z-0 h-[250px] w-[42%] rounded-2xl object-cover ${promo.imagePosition} ${promo.imageWidth}`}
      />

      {/* Elementos decorativos do Figma */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[199px] top-[134px] z-[1] size-64 rounded-full border border-primary"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[191px] top-[142px] z-[1] size-64 rounded-full border-2 border-primary"
      />

      <div className="absolute right-3 top-6 z-10 w-[58%] text-right sm:right-[26px] sm:top-[34px] sm:w-[265px]">
        <h2 className="whitespace-pre-line text-sm font-bold leading-5 text-foreground sm:text-lg sm:leading-6">
          {promo.title}
        </h2>

        <p className="mt-2 text-xs leading-5 text-text-secondary sm:text-sm sm:leading-6">
          {promo.description}
        </p>

        <a
          href="#mercado"
          className="ml-auto mt-5 flex h-10 w-36 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-ink transition-colors hover:bg-primary-dark"
        >
          Explorar

          <img
            src="/assets/icons/curved/Arrow%20-%20Right.svg"
            alt=""
            aria-hidden="true"
            className="size-4"
          />
        </a>
      </div>
    </article>
  )
}

function Promos() {
  return (
    <section
      aria-label="Coleções em destaque"
      className="mx-auto mt-24 grid w-full max-w-[1200px] grid-cols-1 gap-7 lg:grid-cols-2"
    >
      {promos.map((promo) => (
        <PromoCard key={promo.title} promo={promo} />
      ))}
    </section>
  )
}

export default Promos
