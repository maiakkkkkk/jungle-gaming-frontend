import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import type { CatalogSearch } from '@/router'
import { useNfts } from '@/hooks/useNfts'

type Product = {
  id: string
  name: string
  price: string
  oldPrice?: string
  image: string
  alt: string
  portrait?: boolean
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/nft/$nftId"
      params={{ nftId: product.id }}
      className="group flex min-w-0 flex-col gap-3"
    >
      <div
        className={`flex h-48 items-start justify-center rounded-[20px] bg-surface-card ${
          product.portrait ? 'px-3 pt-1 pb-2' : 'px-1 pt-4'
        }`}
      >
        <img
          src={product.image}
          alt={product.alt}
          className={
            product.portrait
              ? 'h-full w-40 rounded-xl object-cover transition-transform group-hover:scale-[1.02]'
              : 'size-40 rounded-2xl object-cover transition-transform group-hover:scale-[1.02]'
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
    </Link>
  )
}

function ProductGrid() {
  const { data, isPending, isError } = useNfts()
  const search = useSearch({ from: '/' })
  const navigate = useNavigate({ from: '/' })

  const products: Product[] = (data?.items ?? []).map((nft) => ({
    id: nft.id,
    name: nft.name,
    price: `${nft.price} ${nft.currency}`,
    oldPrice: nft.oldPrice
      ? `${nft.oldPrice} ${nft.currency}`
      : undefined,
    image: nft.image,
    alt: nft.name,
    portrait: nft.id === 'nft-06',
  }))

  const currentPage = data?.page ?? search.page ?? 1
  const totalPages = data?.totalPages ?? 1
  const activeView = search.view ?? 'all'

  function selectView(view: CatalogSearch['view']) {
    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          view,
          page: 1,
        }
      },
    })
  }

  function changeSort(sort: NonNullable<CatalogSearch['sort']>) {
    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          sort,
          page: 1,
        }
      },
    })
  }

  function goToPage(page: number) {
    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          page,
        }
      },
    })
  }

  const emptyMessage =
    search.view === 'new'
      ? 'Ainda não há dados para novos lançamentos.'
      : search.view === 'trending'
        ? 'Ainda não há dados de NFTs em alta.'
        : 'Nenhum NFT encontrado para esses filtros.'

  const tabClass = (isActive: boolean) =>
    `cursor-pointer border-b-2 pb-2 text-base font-medium leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      isActive
        ? 'border-primary text-text-accent'
        : 'border-transparent text-foreground hover:text-text-accent'
    }`

  return (
    <section className="flex min-w-0 flex-1 flex-col items-end gap-20">
      <div className="flex w-full flex-col gap-8">
        {/* Abas e ordenação */}
        <div className="flex w-full flex-wrap items-center justify-between gap-6">
          <nav
            aria-label="Categorias do catálogo"
            className="flex items-center gap-5"
          >
            <button
              type="button"
              aria-current={activeView === 'all' ? 'page' : undefined}
              onClick={() => selectView(undefined)}
              className={tabClass(activeView === 'all')}
            >
              Todos os NFTs
            </button>

            <button
              type="button"
              aria-current={activeView === 'new' ? 'page' : undefined}
              onClick={() => selectView('new')}
              className={tabClass(activeView === 'new')}
            >
              Novos lançamentos
            </button>

            <button
              type="button"
              aria-current={activeView === 'trending' ? 'page' : undefined}
              onClick={() => selectView('trending')}
              className={tabClass(activeView === 'trending')}
            >
              Em alta
            </button>
          </nav>

          <label className="flex items-center gap-2 text-base text-foreground">
            <span>Ordenar por:</span>

            <span className="relative flex items-center gap-2">
              <select
                aria-label="Ordenar NFTs"
                value={search.sort ?? 'recent'}
                onChange={(event) =>
                  changeSort(
                    event.currentTarget.value as NonNullable<
                      CatalogSearch['sort']
                    >,
                  )
                }
                className="min-w-0 max-w-[220px] cursor-pointer appearance-none bg-transparent pr-1 text-foreground outline-none focus-visible:text-text-accent"
              >
                <option value="recent">Listados recentemente</option>
              </select>

              <img
                src="/assets/icons/two-toned/Iconly/Arrow%20-%20Down%202.svg"
                alt=""
                aria-hidden="true"
                className="pointer-events-none size-4"
              />
            </span>
          </label>
        </div>

        {/* Catálogo */}
        {isPending ? (
          <div
            role="status"
            aria-label="Carregando NFTs"
            className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="h-[250px] animate-pulse rounded-2xl bg-surface-card"
              />
            ))}
          </div>
        ) : isError ? (
          <p role="alert" className="text-foreground">
            Não foi possível carregar os NFTs. Tente novamente.
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-foreground" role="status">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.image} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {data && data.total > 0 && (
        <nav
          aria-label="Paginação do catálogo"
          className="flex items-center gap-2"
        >
          {Array.from(
            { length: totalPages },
            (_, index) => index + 1,
          ).map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? 'page' : undefined}
              onClick={() => goToPage(page)}
              className={`flex size-9 items-center justify-center rounded-sm border border-border text-lg ${
                page === currentPage
                  ? 'bg-primary font-bold text-primary-foreground'
                  : 'text-foreground hover:bg-surface-raised'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            aria-label="Próxima página"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="flex size-9 items-center justify-center rounded-sm border border-border transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40"
          >
            <img
              src="/assets/icons/curved/Arrow%20-%20Right%202.svg"
              alt=""
              aria-hidden="true"
              className="size-4"
            />
          </button>
        </nav>
      )}
    </section>
  )
}

export default ProductGrid
