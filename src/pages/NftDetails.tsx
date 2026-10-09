
import { useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useFavorite, useAddCartItem } from '@/hooks/useMarketplace'
import { useNft } from '@/hooks/useNft'
import { getNfts } from '@/services/nfts'

function NftDetails() {
  const { nftId } = useParams({ from: '/nft/$nftId' })

  return <NftDetailsContent key={nftId} nftId={nftId} />
}

function NftDetailsContent({ nftId }: { nftId: string }) {
  const { data: nft, isPending, isError, error } = useNft(nftId)

  const [selectedEditionId, setSelectedEditionId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>(
    'details',
  )
  const favorite = useFavorite(nftId)
  const addToCart = useAddCartItem()

  const relatedQuery = useQuery({
    queryKey: ['nfts', 'related', nftId],
    queryFn: ({ signal }) => getNfts({ page: 1 }, signal),
    enabled: Boolean(nft),
  })

  const selectedEdition = nft?.editions?.find(
    (edition) => edition.id === selectedEditionId,
  ) ?? nft?.editions?.[0]
  const unavailable = !selectedEdition || selectedEdition.availableQuantity < 1
  const notFound =
    isAxiosError(error) && error.response?.status === 404

  const relatedNfts = (relatedQuery.data?.items ?? [])
    .filter(
      (item) =>
        item.id !== nftId &&
        (nft?.collectionName
          ? item.collectionName === nft.collectionName
          : item.collection === nft?.collection),
    )
    .slice(0, 5)

  const tokenNumber = nft?.name.match(/#(\d+)/)?.[1]
  const tokenId = tokenNumber
    ? `#${tokenNumber.padStart(4, '0')}`
    : nft?.id ?? ''

  const description =
    nft?.description ??
    `${nft?.name} é um colecionável digital da categoria ${nft?.collection}, disponível na rede ${nft?.network}.`

  function renderQuantityControls(mobile = false) {
    if (!nft) return null

    return (
      <div className={`flex items-center gap-3 ${mobile ? 'text-lg' : ''}`}>
        {mobile && <span className="text-text-secondary">Qtd.</span>}

        <button
          type="button"
          aria-label="Diminuir quantidade"
          disabled={quantity <= 1 || unavailable}
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground disabled:opacity-40"
        >
          −
        </button>

        <span aria-live="polite" className="min-w-4 text-center">
          {quantity}
        </span>

        <button
          type="button"
          aria-label="Aumentar quantidade"
          disabled={quantity >= (selectedEdition?.availableQuantity ?? 0) || unavailable}
          onClick={() =>
            setQuantity((value) =>
              Math.min(selectedEdition?.availableQuantity ?? 0, value + 1),
            )
          }
          className="flex size-8 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground disabled:opacity-40"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="mx-auto w-full max-w-[1200px] px-5 pb-40 pt-6 lg:px-0 lg:pb-12">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-text-secondary">
          <Link to="/" className="hover:text-text-accent">
            Início
          </Link>
          {' / '}
          <Link to="/" className="hover:text-text-accent">
            Mercado
          </Link>
          {nft && ` / ${nft.name}`}
        </nav>

        {isPending ? (
          <div
            role="status"
            aria-label="Carregando detalhes do NFT"
            className="grid gap-8 lg:grid-cols-2"
          >
            <div className="aspect-square animate-pulse rounded-xl bg-surface-card" />
            <div className="h-[480px] animate-pulse rounded-xl bg-surface-card" />
          </div>
        ) : isError || !nft ? (
          <section className="py-24 text-center">
            <h1 className="text-2xl font-bold">
              {notFound ? 'NFT não encontrado' : 'Não foi possível carregar o NFT'}
            </h1>
            <p className="mt-3 text-text-secondary">
              {notFound
                ? 'Esse item não existe ou não está mais disponível.'
                : 'Confira sua conexão e tente novamente.'}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary-dark"
            >
              Voltar ao mercado
            </Link>
          </section>
        ) : (
          <>
            <section className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {/* Galeria */}
              <div className="flex min-w-0 flex-col">
                <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl bg-surface-card">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="aspect-square w-full object-cover"
                  />
              </div>
              </div>

              {/* Informações */}
              <div className="flex min-w-0 flex-col gap-5">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-2xl font-bold">{nft.name}</h1>

                    {nft.rating !== undefined && (
                      <span className="text-sm text-text-secondary">
                        <span className="text-text-accent">★</span>{' '}
                        {nft.rating.toFixed(1)}{' '}
                        {nft.reviewCount !== undefined &&
                          `(${nft.reviewCount})`}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xl font-bold text-text-accent">
                    {nft.price} {nft.currency}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="font-bold">Sobre este NFT:</h2>
                  <p className="leading-7 text-text-secondary">
                    {description}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h2 className="font-bold">Edição:</h2>
                  <div className="flex flex-wrap gap-2">
                    {(nft.editions ?? []).map((edition) => (
                      <button
                        key={edition.id}
                        type="button"
                        disabled={edition.availableQuantity < 1}
                        aria-pressed={(selectedEdition?.id ?? '') === edition.id}
                        onClick={() => {
                          setSelectedEditionId(edition.id)
                          setQuantity(1)
                        }}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                          (selectedEdition?.id ?? '') === edition.id
                            ? 'border-primary text-text-accent'
                            : 'border-border text-text-secondary hover:border-primary'
                        } disabled:opacity-40`}
                      >
                        {edition.label}
                      </button>
                    ))}
                  </div>
                  {nft.editions?.length ? null : (
                    <p className="text-sm text-text-secondary">
                      Disponibilidade por edição ainda não informada.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-sm text-text-secondary">
                  <p>ID do token: {tokenId}</p>
                  <p>Coleção: {nft.collectionName ?? nft.collection}</p>
                  <p>Atributos: {(nft.attributes ?? [
                    nft.collection,
                    nft.network,
                  ]).join(', ')}</p>
                  <p>Rede: {nft.network}</p>
                  <p>Contrato: {nft.contractAddress ?? 'Dados não informados no mock.'}</p>
                  <p>Direitos autorais: {nft.creatorRoyalty ?? 'Dados não informados no mock.'}</p>
                </div>

                {unavailable && nft.editions?.length ? (
                  <p role="alert" className="text-destructive">
                    Esta edição está esgotada.
                  </p>
                ) : null}

                <div className="hidden flex-wrap items-center gap-4 lg:flex">
                  {renderQuantityControls()}

                  <button
                    type="button"
                    disabled={unavailable || addToCart.isPending}
                    onClick={() => selectedEdition && addToCart.mutate({
                      nftId: nft.id,
                      editionId: selectedEdition.id,
                      editionLabel: selectedEdition.label,
                      quantity,
                    })}
                    className="rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary-dark disabled:opacity-40"
                  >
                    {addToCart.isPending ? 'Adicionando…' : 'Comprar'}
                  </button>

                  <button
                    type="button"
                    aria-pressed={favorite.isFavorite}
                    disabled={favorite.isPending}
                    onClick={favorite.toggle}
                    className={`rounded-md border px-5 py-3 transition-colors ${
                      favorite.isFavorite
                        ? 'border-primary text-text-accent'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    {favorite.isFavorite ? '♥ Favoritado' : '♡ Favoritar'}
                  </button>
                </div>
                {favorite.hasError && (
                  <p role="alert" className="text-sm text-destructive">
                    Não foi possível atualizar seus favoritos. Tente novamente.
                  </p>
                )}
              </div>
            </section>

            {addToCart.isSuccess && (
              <p role="status" className="mt-4 text-sm text-text-accent">
                NFT adicionado ao carrinho.
              </p>
            )}
            {addToCart.isError && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {isAxiosError<{ message?: string }>(addToCart.error)
                  ? addToCart.error.response?.data.message ?? 'Não foi possível adicionar ao carrinho.'
                  : 'Não foi possível adicionar ao carrinho.'}
              </p>
            )}

            {/* Detalhes e avaliações */}
            <section className="mt-14">
              <div className="flex flex-wrap gap-6 border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  aria-pressed={activeTab === 'details'}
                  className={`border-b-2 pb-3 ${
                    activeTab === 'details'
                      ? 'border-primary text-text-accent'
                      : 'border-transparent text-text-secondary'
                  }`}
                >
                  Detalhes do NFT
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  aria-pressed={activeTab === 'reviews'}
                  className={`border-b-2 pb-3 ${
                    activeTab === 'reviews'
                      ? 'border-primary text-text-accent'
                      : 'border-transparent text-text-secondary'
                  }`}
                >
                  Avaliações de colecionadores
                  {nft.reviewCount !== undefined && ` (${nft.reviewCount})`}
                </button>
              </div>

              <div className="space-y-5 py-6 leading-7 text-text-secondary">
                {activeTab === 'details' ? (
                  <>
                    <p>{description}</p>
                    <p>
                      A obra está disponível na rede {nft.network}. Os
                      detalhes apresentados fazem parte dos dados simulados
                      deste marketplace.
                    </p>
                  </>
                ) : nft.reviewCount ? (
                  <p>
                    Este NFT possui {nft.reviewCount} avaliações registradas
                    no cenário simulado. O conteúdo individual das avaliações
                    ainda não está disponível.
                  </p>
                ) : (
                  <p>Ainda não há avaliações disponíveis para este NFT.</p>
                )}
              </div>
            </section>

            {/* Recomendações */}
            {(relatedQuery.isPending || relatedNfts.length > 0) && (
              <section className="mt-12">
              <h2 className="border-b border-border pb-4 text-xl font-bold text-text-accent">
                Mais desta coleção
              </h2>

              {relatedQuery.isPending ? (
                <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <div
                      key={index}
                      className="aspect-square animate-pulse rounded-xl bg-surface-card"
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
                  {relatedNfts.map((item) => (
                    <Link
                      key={item.id}
                      to="/nft/$nftId"
                      params={{ nftId: item.id }}
                      className="group min-w-0"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="aspect-square w-full rounded-xl bg-surface-card object-cover transition-transform group-hover:scale-[1.02]"
                      />
                      <p className="mt-3 truncate text-sm group-hover:text-text-accent">
                        {item.name}
                      </p>
                      <p className="mt-1 font-bold text-text-accent">
                        {item.price} {item.currency}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
              </section>
            )}
          </>
        )}
      </div>

      {nft && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-card p-4 shadow-lg lg:hidden">
          <div className="mx-auto flex max-w-[600px] flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              {renderQuantityControls(true)}
              <span className="text-lg font-bold text-text-accent">
                {nft.price} {nft.currency}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={unavailable || addToCart.isPending}
                onClick={() => selectedEdition && addToCart.mutate({
                  nftId: nft.id,
                  editionId: selectedEdition.id,
                  editionLabel: selectedEdition.label,
                  quantity,
                })}
                className="flex-1 rounded-full bg-primary px-4 py-4 font-bold text-primary-foreground disabled:opacity-40"
              >
                {addToCart.isPending ? 'Adicionando…' : 'Comprar NFT'}
              </button>

              <button
                type="button"
                aria-label="Favoritar NFT"
                aria-pressed={favorite.isFavorite}
                disabled={favorite.isPending}
                onClick={favorite.toggle}
                className="flex size-14 items-center justify-center rounded-full border border-border text-2xl text-text-accent"
              >
                {favorite.isFavorite ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

export default NftDetails
