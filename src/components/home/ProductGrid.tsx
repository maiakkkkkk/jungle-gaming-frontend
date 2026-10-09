import { useNfts } from '@/hooks/useNfts'

type Product = {
  name: string
  price: string
  oldPrice?: string
  image: string
  alt: string
  portrait?: boolean
}

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
    const { data, isPending, isError } = useNfts()

    const products: Product[] = (data?.items ?? []).map((nft) => ({
    name: nft.name,
    price: `${nft.priceEth} ETH`,
    oldPrice: nft.oldPriceEth
        ? `${nft.oldPriceEth} ETH`
        : undefined,
    image: nft.image,
    alt: nft.name,
    portrait: nft.id === 'nft-06',
    }))

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
        {isPending ? (
            <div
                role="status"
                aria-label="Carregando NFTs"
                className="grid w-full grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3"
            >
                {Array.from({ length: 9 }, (_, index) => (
                    <div
                        key={index}
                        aria-hidden="true"
                        className="h-[350px] animate-pulse rounded-2xl bg-surface-card"
                    />
            ))}
            </div>
        ) : isError ? (
            <p role="alert" className="text-foreground">
                Não foi possível carregar os NFTs. Tente novamente.
            </p>
        ) : products.length === 0 ? (
            <p className="text-foreground">Nenhum NFT encontrado.</p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.image} product={product} />
            ))}
          </div>
        )}
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
