import { Button } from "@/components/ui/button"

const collections = [
  { name: "Arte digital", count: 33 },
  { name: "Fotografia", count: 12 },
  { name: "Música", count: 65 },
  { name: "Arte 3D", count: 39 },
  { name: "Colecionáveis", count: 23 },
  { name: "Generativa", count: 17 },
  { name: "Jogos", count: 19 },
  { name: "Assinaturas", count: 13 },
  { name: "Utilidade", count: 18 },
]

const networks = [
  { name: "Ethereum", count: 119 },
  { name: "Polygon", count: 78 },
  { name: "Solana", count: 86 },
]

function ProductsSidebar() {
  return (
    <aside className="flex w-full flex-col gap-6 md:w-80">
      <section className="w-full overflow-hidden bg-surface-card p-5">
        <div className="flex flex-col gap-10">
          {/* Filtro por coleção */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Coleções
            </h2>

            <ul className="flex flex-col px-3">
              {collections.map((collection, index) => (
                <li
                  key={collection.name}
                  className="flex items-start justify-between"
                >
                  <span
                    className={`text-base leading-10 ${
                      index === 0
                        ? "text-text-accent"
                        : "text-text-secondary"
                    }`}
                  >
                    {collection.name}
                  </span>

                  <span
                    className={`text-base font-bold leading-10 ${
                      index === 0
                        ? "text-text-accent"
                        : "text-text-secondary"
                    }`}
                  >
                    ({collection.count})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Filtro por preço */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Faixa de preço
            </h2>

            <div className="flex flex-col gap-3 overflow-hidden pl-3">
              <div
                className="flex items-center"
                aria-hidden="true"
              >
                <span className="size-3.5 shrink-0 rounded-full border-[3px] border-ink bg-primary" />

                <span className="h-1 w-40 bg-primary" />

                <span className="size-3.5 shrink-0 rounded-full border-[3px] border-ink bg-primary" />

                <span className="h-1 flex-1 bg-primary" />
              </div>

              <p className="text-base text-foreground">
                Preço: 0,02 - 12,30 ETH
              </p>

              <Button
                type="button"
                className="h-auto self-start rounded-md bg-primary px-3 py-2 text-base font-bold leading-5 text-primary-foreground hover:bg-primary-dark"
              >
                Aplicar
              </Button>
            </div>
          </div>

          {/* Filtro por rede */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold leading-4 text-foreground">
              Rede
            </h2>

            <ul className="flex flex-col pl-3">
              {networks.map((network) => (
                <li
                  key={network.name}
                  className="flex items-start justify-between"
                >
                  <span className="text-base leading-10 text-text-secondary">
                    {network.name}
                  </span>

                  <span className="text-base leading-10 text-text-secondary">
                    ({network.count})
                  </span>
                </li>
              ))}
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