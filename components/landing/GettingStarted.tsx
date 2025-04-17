import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export function GettingStarted() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">Getting Started</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Follow these simple steps to begin your journey
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2">
          <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Create an Account</h3>
            </div>
            <p className="text-muted-foreground">
              Sign up with your email and basic information to get started.
            </p>
          </div>
          <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Select Your Category</h3>
            </div>
            <p className="text-muted-foreground">
              Choose your career path: Dream Jobs, Super Dream Jobs, or Higher Studies.
            </p>
          </div>
          <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Access Learning Materials</h3>
            </div>
            <p className="text-muted-foreground">
              Get access to curated resources and weekly coding tasks.
            </p>
          </div>
          <div className="flex flex-col space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Complete Weekly Tasks</h3>
            </div>
            <p className="text-muted-foreground">
              Submit your solutions and track your progress.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tighter text-foreground">For Alumni</h3>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Share your experience and help the next generation
            </p>
          </div>
          <Link href="/register">
            <Button size="lg">Join as Alumni</Button>
          </Link>
        </div>
      </div>
    </section>
  )
} 