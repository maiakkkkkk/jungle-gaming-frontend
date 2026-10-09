function Hero() {
  return (
    <section className="mx-auto mt-6 h-auto w-full max-w-[1200px] px-6 lg:mt-8 lg:h-96 lg:pl-10 lg:pr-0">
      <div className="flex w-full items-center gap-3 lg:h-full lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-4 lg:w-[600px] lg:flex-none lg:items-end lg:gap-11">
          <div className="flex w-full flex-col items-start gap-3 lg:gap-8">
            <div className="flex w-full flex-col items-start gap-1">
              <div className="flex w-full flex-col items-start gap-2">
                <span className="text-sm font-medium leading-4 tracking-wider text-foreground">
                  Bem-vindo à Kurio
                </span>

                <h1 className="text-lg font-bold leading-7 text-foreground min-[390px]:text-xl sm:text-2xl lg:text-5xl lg:leading-[70px]">
                  SEJA DONO DO FUTURO
                  <br />
                  DA ARTE DIGITAL
                </h1>
              </div>

              <p className="w-full text-[11px] leading-4 text-muted-foreground sm:text-xs lg:w-[557px] lg:text-sm lg:leading-6">
                Descubra NFTs selecionados de criadores emergentes e
                consagrados. Colecione arte digital rara, apoie artistas e
                tenha uma parte da cultura da internet.
              </p>
            </div>

            <button
              type="button"
              className="h-10 w-36 rounded-md bg-primary px-7 py-2.5 text-base font-bold leading-5 text-primary-foreground"
            >
              EXPLORAR
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
          </div>
        </div>

        <img
          src="/assets/images/Frame%20136.png"
          alt="Obra de arte digital em destaque"
          className="size-28 shrink-0 rounded-2xl object-cover sm:size-32 lg:size-96 lg:rounded-3xl"
        />
      </div>
    </section>
  )
}

export default Hero
