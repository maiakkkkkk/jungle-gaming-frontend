import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import type { CatalogSearch } from '@/router'
import { Button } from '@/components/ui/button'

const collections = [
  { name: 'Arte digital', count: 2 },
  { name: 'Fotografia', count: 1 },
  { name: 'Música', count: 1 },
  { name: 'Arte 3D', count: 2 },
  { name: 'Colecionáveis', count: 1 },
  { name: 'Generativa', count: 1 },
  { name: 'Jogos', count: 2 },
  { name: 'Assinaturas', count: 1 },
  { name: 'Utilidade', count: 1 },
]

const networks = [
  { name: 'Ethereum', count: 4 },
  { name: 'Polygon', count: 4 },
  { name: 'Solana', count: 4 },
]

const PRICE_MIN = 0.02
const PRICE_MAX = 18.3
const DEFAULT_MAX = 12.3
const PRICE_STEP = 0.01

const filterButtonClass =
  'flex w-full cursor-pointer items-start justify-between rounded-md px-2 text-left text-base leading-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card'

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function ProductsSidebar() {
  const search = useSearch({ from: '/' })

  return (
    <ProductsSidebarContent
      key={JSON.stringify([search.minPrice, search.maxPrice, search.network])}
      search={search}
    />
  )
}

function ProductsSidebarContent({ search }: { search: CatalogSearch }) {
  const navigate = useNavigate({ from: '/' })

  const [minInput, setMinInput] = useState(
    search.minPrice ?? PRICE_MIN,
  )
  const [maxInput, setMaxInput] = useState(
    search.maxPrice ?? DEFAULT_MAX,
  )
  const [priceError, setPriceError] = useState('')

  const currency =
    search.network === 'Ethereum'
      ? 'ETH'
      : search.network === 'Polygon'
        ? 'POL'
        : search.network === 'Solana'
          ? 'SOL'
          : undefined

  const minPercent =
    ((minInput - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  const maxPercent =
    ((maxInput - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100

  function selectCollection(name: string) {
    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          collection:
            current.collection === name ? undefined : name,
          page: 1,
        }
      },
    })
  }

  function selectNetwork(name: string) {
    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          network: current.network === name ? undefined : name,
          minPrice: undefined,
          maxPrice: undefined,
          page: 1,
        }
      },
    })
  }

  function applyPriceFilter() {
    if (
      minInput < PRICE_MIN ||
      maxInput > PRICE_MAX ||
      minInput >= maxInput
    ) {
      setPriceError('A faixa de preço informada é inválida.')
      return
    }

    if (!currency) {
      setPriceError('Selecione uma rede antes de aplicar o preço.')
      return
    }

    setPriceError('')

    void navigate({
      resetScroll: false,
      search: (previous) => {
        const current = previous as CatalogSearch

        return {
          ...current,
          minPrice: minInput,
          maxPrice: maxInput,
          page: 1,
        }
      },
    })
  }

  return (
    <aside className="flex w-full flex-col gap-6 md:w-80">
      <section className="w-full overflow-hidden bg-surface-card p-5">
        <div className="flex flex-col gap-10">
          {/* Coleções */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Coleções
            </h2>

            <ul className="flex flex-col px-3">
              {collections.map((collection) => {
                const selected = search.collection === collection.name

                return (
                  <li key={collection.name}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectCollection(collection.name)}
                      className={`${filterButtonClass} ${
                        selected
                          ? 'bg-surface-raised text-text-accent'
                          : 'text-text-secondary hover:bg-surface-raised hover:text-text-accent'
                      }`}
                    >
                      <span>{collection.name}</span>
                      <span className="font-bold">
                        ({collection.count})
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Faixa de preço */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Faixa de preço
            </h2>

            <div className="flex flex-col gap-3 overflow-hidden px-3">
              <p className="text-sm text-text-secondary">
                {currency
                  ? `Valores em ${currency}`
                  : 'Selecione uma rede para filtrar.'}
              </p>

              <div className="relative mx-1 h-5">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary/30" />

                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
                  style={{
                    left: `${minPercent}%`,
                    right: `${100 - maxPercent}%`,
                  }}
                />

                <input
                  type="range"
                  aria-label="Preço mínimo"
                  aria-valuetext={`${formatPrice(minInput)} ${currency ?? ''}`}
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={minInput}
                  disabled={!currency}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setMinInput(Math.min(value, maxInput - PRICE_STEP))
                    setPriceError('')
                  }}
                  className="pointer-events-none absolute inset-0 z-20 h-5 w-full appearance-none bg-transparent disabled:opacity-50 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-primary"
                />

                <input
                  type="range"
                  aria-label="Preço máximo"
                  aria-valuetext={`${formatPrice(maxInput)} ${currency ?? ''}`}
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  step={PRICE_STEP}
                  value={maxInput}
                  disabled={!currency}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setMaxInput(Math.max(value, minInput + PRICE_STEP))
                    setPriceError('')
                  }}
                  className="pointer-events-none absolute inset-0 z-10 h-5 w-full appearance-none bg-transparent disabled:opacity-50 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-track]:h-1 [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-primary"
                />
              </div>

              <p className="text-base text-foreground">
                Preço: {formatPrice(minInput)} – {formatPrice(maxInput)}
                {currency ? ` ${currency}` : ''}
              </p>

              {priceError && (
                <p role="alert" className="text-sm text-destructive">
                  {priceError}
                </p>
              )}

              <Button
                type="button"
                disabled={!currency}
                onClick={applyPriceFilter}
                className="h-auto self-start rounded-md bg-primary px-3 py-2 text-base font-bold leading-5 text-primary-foreground hover:bg-primary-dark"
              >
                Aplicar
              </Button>
            </div>
          </div>

          {/* Redes */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Rede
            </h2>

            <ul className="flex flex-col pl-3">
              {networks.map((network) => {
                const selected = search.network === network.name

                return (
                  <li key={network.name}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectNetwork(network.name)}
                      className={`${filterButtonClass} ${
                        selected
                          ? 'bg-surface-raised text-text-accent'
                          : 'text-text-secondary hover:bg-surface-raised hover:text-text-accent'
                      }`}
                    >
                      <span>{network.name}</span>
                      <span>({network.count})</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* NFT em destaque */}
      <section className="relative flex h-[470px] w-full flex-col gap-6 overflow-hidden bg-gradient-to-b from-orange-400/10 to-orange-400/5 pt-6 md:w-80">
        <div className="flex flex-col gap-4 px-5">
          <h2 className="text-2xl font-bold leading-8 text-text-accent">
            NFT EM DESTAQUE
          </h2>

          <p className="text-center text-xl font-bold leading-4 text-foreground">
            OFERTA LIMITADA
          </p>
        </div>

        <img
          src="/assets/images/NFT%20Artwork%2018.png"
          alt="NFT em destaque"
          className="h-[358px] w-full object-cover object-top"
        />
      </section>
    </aside>
  )
}

export default ProductsSidebar
