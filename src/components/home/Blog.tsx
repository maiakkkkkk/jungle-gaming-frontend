
type BlogPost = {
  date: string
  title: string
  description: string
  image: string
  alt: string
}

const posts: BlogPost[] = [
  {
    date: "12 de setembro | Leitura de 6 min",
    title: "Como funciona a propriedade de NFTs",
    description:
      "Aprenda a colecionar, negociar e verificar ativos digitais.",
    image: "/assets/images/Image.png",
    alt: "Ilustração sobre propriedade de NFTs",
  },
  {
    date: "13 de setembro | Leitura de 2 min",
    title: "10 artistas digitais para acompanhar",
    description:
      "Conheça criadores que moldam a cultura digital.",
    image: "/assets/images/Image-1.png",
    alt: "Ilustração de um artista digital",
  },
  {
    date: "15 de setembro | Leitura de 3 min",
    title: "Raridade, atributos e procedência",
    description:
      "Entenda raridade, procedência, direitos autorais e utilidade.",
    image: "/assets/images/Image-2.png",
    alt: "Ilustração sobre raridade e atributos de NFTs",
  },
  {
    date: "15 de setembro | Leitura de 2 min",
    title: "Como proteger sua carteira",
    description:
      "Proteja sua carteira, seus ativos e sua identidade.",
    image: "/assets/images/Image-3.png",
    alt: "Ilustração sobre segurança de carteiras digitais",
  },
]

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-lg bg-surface-card sm:w-64">
      <img
        src={post.image}
        alt={post.alt}
        className="h-48 w-full object-cover"
      />

      <div className="flex flex-1 flex-col items-start gap-2 px-4 pt-3 pb-4">
        <p className="text-xs font-medium leading-4 text-text-secondary">
          {post.date}
        </p>

        <h3 className="text-base font-bold text-card-foreground">
          {post.title}
        </h3>

        <p className="text-xs font-medium leading-4 text-text-secondary">
          {post.description}
        </p>

        <span className="inline-flex items-center gap-1 text-xs font-bold leading-4 text-text-accent">
          Ler mais
          <span aria-hidden="true" className="font-normal">
            →
          </span>
        </span>
      </div>
    </article>
  )
}

function Blog() {
  return (
    <section
      id="blog"
      aria-labelledby="blog-title"
      className="mx-auto mt-24 flex w-full max-w-[1200px] flex-col items-center gap-10 px-4 lg:px-0"
    >
      <header className="flex w-full flex-col items-center gap-3 text-center">
        <h2
          id="blog-title"
          className="text-3xl font-bold text-card-foreground"
        >
          Diário da Cunhagem
        </h2>

        <p className="text-sm text-text-secondary">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </header>

      <div className="flex w-full flex-wrap items-stretch justify-start gap-6">
        {posts.map((post) => (
          <BlogCard key={post.title} post={post} />
        ))}
      </div>
    </section>
  )
}

export default Blog
