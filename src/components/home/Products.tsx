import ProductsSidebar from "@/components/home/ProductsSidebar"
import ProductGrid from "@/components/home/ProductGrid"

function Products() {
  return (
    <section
      id="mercado"
      className="mx-auto mt-24 w-full max-w-[1200px]"
    >
      <div className="flex flex-col items-start gap-12 lg:flex-row">
        <ProductsSidebar />
        <ProductGrid />
      </div>
    </section>
  )
}

export default Products