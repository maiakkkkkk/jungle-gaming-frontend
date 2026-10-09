
type Product = {
  name: string
  price: string
  oldPrice?: string
  image: string
  alt: string
  portrait?: boolean
}

const products: Product[] = [
  {
    name: "Emerald Ape #042",
    price: "1.19 ETH",
    image: "/assets/images/NFT%20Artwork%2003.png",
    alt: "Macaco com jaqueta verde e óculos",
  },
  {
    name: "Sage Nomad #009",
    price: "1.69 ETH",
    image: "/assets/images/NFT%20Artwork%2004.png",
    alt: "Macaco com chapéu e moletom roxo",
  },
  {
    name: "Neon Vessel #552",
    price: "1.99 ETH",
    oldPrice: "2.29 ETH",
    image: "/assets/images/NFT%20Artwork%2005.png",
    alt: "Macaco de terno claro",
  },
  {
    name: "Cosmic Bloom #118",
    price: "1.29 ETH",
    image: "/assets/images/NFT%20Artwork%2006.png",
    alt: "Macaco com chapéu e moletom roxo",
    portrait: true,
  },
  {
    name: "Violet Nomad #314",
    price: "1.39 ETH",
    image: "/assets/images/NFT%20Artwork%2007.png",
    alt: "Macaco com roupa roxa",
  },
  {
    name: "Ivory Baron #088",
    price: "1.79 ETH",
    image: "/assets/images/NFT%20Artwork%2008.png",
    alt: "Macaco de terno bege",
  },
  {
    name: "Golden Beat #207",
    price: "0.99 ETH",
    image: "/assets/images/NFT%20Artwork%2009.png",
    alt: "Macaco dourado com fones de ouvido",
  },
  {
    name: "Golden Echo #274",
    price: "0.79 ETH",
    image: "/assets/images/NFT%20Artwork%2010.png",
    alt: "Arte digital de um macaco dourado",
  },
  {
    name: "Golden Signal #160",
    price: "0.39 ETH",
    image: "/assets/images/NFT%20Artwork%2011.png",
    alt: "Macaco dourado com fones de ouvido",
  },
]

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex min-w-0 flex-col gap-3">
      <div
        className={`flex h-72 items-start justify-center bg-surface-card ${
          product.portrait ? "px-5 pt-1.5 pb-2" : "px-1 pt-6"
        }`}
      >
        <img
          src={product.image}
          alt={product.alt}
          className={
            product.portrait
              ? "h-full w-56 rounded-xl object-cover"
              : "size-64 rounded-2xl object-cover"
          }
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base leading-4 text-foreground">
          {product.name}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold leading-4 text-text-accent">
            {product.price}
          </span>

          {product.oldPrice && (
            <span className="text-lg leading-4 text-text-secondary">
              {product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function ProductGrid() {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-end gap-20">
      {/* Abas e ordenação */}
      <div className="flex w-full flex-col gap-8">
        <div className="flex w-full flex-wrap items-center justify-between gap-6">
          <nav aria-label="Categorias do catálogo">
            <div className="relative flex items-center gap-5">
              <button
                type="button"
                aria-current="page"
                className="pb-2 text-base font-medium leading-4 text-text-accent"
              >
                Todos os NFTs
              </button>

              <button
                type="button"
                className="pb-2 text-base font-medium leading-4 text-foreground"
              >
                Novos lançamentos
              </button>

              <button
                type="button"
                className="pb-2 text-base font-medium leading-4 text-foreground"
              >
                Em alta
              </button>

              <span className="absolute bottom-0 left-0 h-0.5 w-24 bg-primary" />
            </div>
          </nav>

          <div className="flex items-center gap-2 text-base text-foreground">
            <span>Ordenar por:</span>

            <button
              type="button"
              className="flex items-center gap-2"
              aria-label="Ordenar NFTs"
            >
              Listados recentemente

              <img
                src="/assets/icons/two-toned/Iconly/Arrow%20-%20Down%202.svg"
                alt=""
                aria-hidden="true"
                className="size-4"
              />
            </button>
          </div>
        </div>

        {/* Catálogo */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.image} product={product} />
          ))}
        </div>
      </div>

      {/* Paginação */}
      <nav
        aria-label="Paginação do catálogo"
        className="flex items-center gap-2"
      >
        <button
          type="button"
          aria-current="page"
          className="flex size-9 items-center justify-center rounded-sm bg-primary text-lg font-bold text-primary-foreground"
        >
          1
        </button>

        {[2, 3, 4].map((page) => (
          <button
            key={page}
            type="button"
            className="flex size-9 items-center justify-center rounded-sm border border-border text-lg text-foreground"
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          aria-label="Próxima página"
          className="flex size-9 items-center justify-center rounded-sm border border-border"
        >
          <img
            src="/assets/icons/curved/Arrow%20-%20Right.svg"
            alt=""
            aria-hidden="true"
            className="size-4"
          />
        </button>
      </nav>
    </section>
  )
}

export default ProductGrid
