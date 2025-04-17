import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center justify-between">
          <div className="flex flex-col justify-center space-y-4 lg:pr-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                From Campus to Corporate:{" "}
                <span className="bg-gradient-to-r from-[#00FFFF] via-[#9933FF] to-[#9933FF] text-transparent bg-clip-text">
                  Your Placement Success Partner
                </span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Comprehensive preparation for VIT students to excel in placements and higher studies
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Join 1000+ VIT students already preparing with us
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
          <div className="lg:flex lg:justify-end">
            <div className="relative w-full h-[400px] lg:h-[500px] overflow-hidden rounded-[2rem]">
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                <Image
                  src="/image-1.webp"
                  alt="Campus to Corporate Illustration"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 