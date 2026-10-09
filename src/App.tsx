import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

import Hero from "@/components/home/Hero"
import Products from "@/components/home/Products"
import Promos from "@/components/home/Promos"
import Blog from "@/components/home/Blog"

function App() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Products />
      <Promos />
      <Blog />
      <Footer />
    </main>
  )
}

export default App