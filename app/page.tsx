import { Header } from "@/components/landing/Header"
import { HeroSection } from "@/components/landing/HeroSection"
import { KeyFeatures } from "@/components/landing/KeyFeatures"
import { CategorySelection } from "@/components/landing/CategorySelection"
import { GettingStarted } from "@/components/landing/GettingStarted"
import { FAQ } from "@/components/landing/FAQ"
import { Footer } from "@/components/landing/Footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <KeyFeatures />
        <CategorySelection />
        <GettingStarted />
        <FAQ />
      </main>
      <Footer />
    </div>
  )
}
