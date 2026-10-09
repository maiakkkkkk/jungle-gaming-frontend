function Hero() {
  return (
    <section className="mx-auto mt-8 h-96 w-full max-w-[1200px] pl-10">
      <div className="flex h-full w-full items-center justify-between">
        <div className="flex w-[600px] flex-col items-end gap-11">
          <div className="flex w-full flex-col items-start gap-8">
            <div className="flex w-full flex-col items-start gap-1">
              <div className="flex w-full flex-col items-start gap-2">
                <span className="text-sm font-medium leading-4 tracking-wider text-foreground">
                  Bem-vindo à Kurio
                </span>

                <h1 className="text-5xl font-bold leading-[70px] text-foreground">
                  SEJA DONO DO FUTURO
                  <br />
                  DA ARTE DIGITAL
                </h1>
              </div>

              <p className="w-[557px] text-sm leading-6 text-muted-foreground">
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
          src="public\assets\images\Frame 136.png"
          alt="Obra de arte digital em destaque"
          className="size-96 rounded-3xl object-cover"
        />
      </div>
    </section>
  )
}

export default Hero