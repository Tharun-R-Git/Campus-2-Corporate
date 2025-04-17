import { ChevronDown } from "lucide-react"

export function FAQ() {
  return (
    <section className="w-full py-12 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">Frequently Asked Questions</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Find answers to common questions about our platform
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-3xl gap-6 py-12">
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Who can register on this platform?</h3>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              The platform is open to all students and alumni of our institution. Students can register to access learning materials and track their progress, while alumni can contribute by sharing their experiences and insights.
            </p>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">How are the coding tasks evaluated?</h3>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Coding tasks are automatically evaluated based on predefined test cases. The system checks for correctness, efficiency, and code quality. You'll receive detailed feedback on your submissions.
            </p>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Can I change my selected category later?</h3>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Yes, you can change your category at any time. However, your progress in the current category will be saved, and you'll need to start fresh in the new category.
            </p>
          </div>
          <div className="rounded-lg border p-6 shadow-sm transition-all hover:shadow-md bg-card text-card-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">How can alumni contribute to the platform?</h3>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-muted-foreground">
              Alumni can share their placement experiences, interview tips, and insights about their companies. They can also participate in mentorship programs and help students prepare for interviews.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 