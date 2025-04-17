import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getTaskById, getStudentSubmission } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskSubmissionForm from "@/components/task-submission-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface TaskPageProps {
  params: {
    taskId: string
  }
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = params

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const student = user as Student

  if (!student.category) {
    redirect("/dashboard/tasks")
  }

  // Check if the task exists - use taskId directly
  const task = await getTaskById(taskId)

  if (!task) {
    redirect("/dashboard/tasks")
  }

  // Check if the student has already submitted this task
  const submission = await getStudentSubmission(session.user.id, taskId)

  if (submission) {
    redirect(`/dashboard/tasks/results/${taskId}`)
  }

  // Check if the deadline has passed
  const isDeadlinePassed = new Date() > new Date(task.deadline)

  if (isDeadlinePassed) {
    redirect("/dashboard/tasks")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Weekly Tasks
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">
            Week {task.week} Assessment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Week {task.week} - {student.category}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
          <CardTitle className="text-blue-800 dark:text-blue-300">Task Description</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 dark:bg-gray-900">
          <p className="dark:text-white">{task.description}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mcq">
        <TabsList className="bg-blue-50 dark:bg-blue-900/50 p-1 border border-blue-100 dark:border-blue-800">
          <TabsTrigger
            value="mcq"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Multiple Choice Questions
          </TabsTrigger>
          <TabsTrigger
            value="coding"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Coding Questions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mcq" className="space-y-4 mt-4">
          <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
              <CardTitle className="text-blue-800 dark:text-blue-300">Multiple Choice Questions</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Select the correct answer for each question
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900">
              <TaskSubmissionForm task={task} studentId={session.user.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coding" className="space-y-4 mt-4">
          <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
              <CardTitle className="text-blue-800 dark:text-blue-300">Coding Questions</CardTitle>
              <CardDescription className="dark:text-gray-400">Solve the following coding problems</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900">
              <TaskSubmissionForm task={task} studentId={session.user.id} isCoding />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
