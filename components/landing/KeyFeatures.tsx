import {
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  LineChart,
  Users,
} from "lucide-react"

export function KeyFeatures() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Key Features
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to prepare for your dream placement
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Curated Learning Materials</h3>
                <p className="mt-2 text-muted-foreground">
                  Access carefully selected resources aligned with your career goals
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Weekly Coding Tasks</h3>
                <p className="mt-2 text-muted-foreground">
                  Practice with real interview-style coding problems
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <LineChart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Progress Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Monitor your learning journey with detailed analytics
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Deadline Notifications</h3>
                <p className="mt-2 text-muted-foreground">
                  Stay on track with timely reminders for tasks and assessments
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Alumni Insights</h3>
                <p className="mt-2 text-muted-foreground">
                  Learn from the experiences of successful alumni
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-card text-card-foreground rounded-lg border border-border">
            <div className="flex items-start">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Automated Evaluation</h3>
                <p className="mt-2 text-muted-foreground">
                  Get instant feedback on your coding solutions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 