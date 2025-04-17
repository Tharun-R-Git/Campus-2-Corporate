import { GraduationCap } from "lucide-react"

export function CategorySelection() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">Choose Your Path</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Select the category that aligns with your career goals
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-3">
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Dream Jobs</h3>
            <p className="text-center text-muted-foreground">
              Prepare for roles at top tech companies with competitive packages.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Super Dream Jobs</h3>
            <p className="text-center text-muted-foreground">
              Target elite positions at industry-leading organizations.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Higher Studies</h3>
            <p className="text-center text-muted-foreground">
              Prepare for graduate programs and entrance exams.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 