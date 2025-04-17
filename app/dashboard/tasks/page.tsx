import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getAllWeeklyTasks, getStudentSubmissions } from "@/lib/db-utils"
import type { Student, WeeklyTask } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import CategorySelection from "@/components/category-selection"
import { CheckCircle, Clock, AlertTriangle, Code, FileQuestion } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function TasksPage() {
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
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Weekly Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete your weekly assignments</p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
            <CardTitle className="text-blue-800 dark:text-blue-300">Select Your Preparation Category</CardTitle>
            <CardDescription className="dark:text-gray-400">
              You need to select a category to access weekly tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 dark:bg-gray-900">
            <CategorySelection currentCategory={student.category} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch weekly tasks for the student's category
  const weeklyTasks = await getAllWeeklyTasks(student.category)

  // Fetch student submissions
  const submissions = await getStudentSubmissions(session.user.id)

  // Create a map of task IDs to submission status
  const submissionMap = new Map()
  submissions.forEach((submission) => {
    submissionMap.set(submission.taskId.toString(), submission)
  })

  // Group tasks by week
  const tasksByWeek: Record<number, WeeklyTask[]> = {}
  weeklyTasks.forEach((task) => {
    if (!tasksByWeek[task.week]) {
      tasksByWeek[task.week] = []
    }
    tasksByWeek[task.week].push(task)
  })

  const weeks = Object.keys(tasksByWeek)
    .map(Number)
    .sort((a, b) => a - b)

  // Helper function to check if a deadline has passed
  const isDeadlinePassed = (deadline: Date) => {
    return new Date() > new Date(deadline)
  }

  // Separate completed, pending, and expired tasks
  const completedTasks = weeklyTasks.filter((task) => submissionMap.has(task._id?.toString()))

  const pendingTasks = weeklyTasks.filter(
    (task) => !submissionMap.has(task._id?.toString()) && !isDeadlinePassed(task.deadline),
  )

  const expiredTasks = weeklyTasks.filter(
    (task) => !submissionMap.has(task._id?.toString()) && isDeadlinePassed(task.deadline),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Weekly Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Complete your weekly assignments for {student.category}</p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-blue-50 dark:bg-blue-900/50 p-1 border border-blue-100 dark:border-blue-800">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Pending
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="expired"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Expired
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {weeks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">
                  No tasks available for {student.category} yet. Please check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {weeklyTasks.map((task) => {
                const submission = submissionMap.get(task._id?.toString())
                const isSubmitted = !!submission
                const deadlinePassed = isDeadlinePassed(task.deadline)

                return (
                  <AccordionItem
                    key={task._id?.toString()}
                    value={`task-${task._id}`}
                    className={`border rounded-lg overflow-hidden ${
                      isSubmitted
                        ? "border-green-500 dark:border-green-700"
                        : deadlinePassed
                          ? "border-red-300 dark:border-red-700"
                          : "border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <AccordionTrigger
                      className={`px-6 py-4 hover:no-underline ${
                        isSubmitted
                          ? "bg-green-50 dark:bg-green-900/30"
                          : deadlinePassed
                            ? "bg-red-50 dark:bg-red-900/30"
                            : "bg-blue-50 dark:bg-blue-900/30"
                      }`}
                    >
                      <div className="flex flex-1 justify-between items-center">
                        <div className="text-left">
                          <h3
                            className={`text-lg font-semibold ${
                              isSubmitted
                                ? "text-green-800 dark:text-green-400"
                                : deadlinePassed
                                  ? "text-red-800 dark:text-red-400"
                                  : "text-blue-800 dark:text-blue-400"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        </div>
                        {isSubmitted ? (
                          <Badge className="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        ) : deadlinePassed ? (
                          <Badge variant="destructive" className="dark:bg-red-700 dark:hover:bg-red-600">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Expired
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          >
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="mr-1 h-4 w-4" />
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <FileQuestion className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span>MCQs: {task.mcqs.length}</span>
                          </div>
                          <div className="flex items-center">
                            <Code className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                            <span>Coding: {task.codingQuestions.length}</span>
                          </div>
                        </div>

                        {isSubmitted ? (
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <span className="text-sm font-medium dark:text-white">Your Score: </span>
                              <span className="ml-2 text-lg font-bold text-green-600 dark:text-green-400">
                                {submission.totalScore} / {task.mcqs.length + task.codingQuestions.length}
                              </span>
                            </div>
                            <Link href={`/dashboard/tasks/results/${task._id}`}>
                              <div className="w-full py-2 px-4 rounded-md text-center text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70">
                                View Results
                              </div>
                            </Link>
                          </div>
                        ) : deadlinePassed ? (
                          <div className="mt-4 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            <span>This task can no longer be submitted</span>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <Link href={`/dashboard/tasks/${task._id}`}>
                              <div className="w-full py-2 px-4 rounded-md text-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                                Start Task
                              </div>
                            </Link>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingTasks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">No pending tasks available. You're all caught up!</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {pendingTasks.map((task) => (
                <AccordionItem
                  key={task._id?.toString()}
                  value={`task-${task._id}`}
                  className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 bg-blue-50 dark:bg-blue-900/30 hover:no-underline">
                    <div className="flex flex-1 justify-between items-center">
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                      >
                        <Clock className="mr-1 h-3 w-3" /> Pending
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <FileQuestion className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>MCQs: {task.mcqs.length}</span>
                        </div>
                        <div className="flex items-center">
                          <Code className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                          <span>Coding: {task.codingQuestions.length}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Link href={`/dashboard/tasks/${task._id}`}>
                          <div className="w-full py-2 px-4 rounded-md text-center text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
                            Start Task
                          </div>
                        </Link>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedTasks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">
                  You haven't completed any tasks yet. Start working on your pending tasks!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {completedTasks.map((task) => {
                const submission = submissionMap.get(task._id?.toString())
                return (
                  <AccordionItem
                    key={task._id?.toString()}
                    value={`task-${task._id}`}
                    className="border border-green-500 dark:border-green-700 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 bg-green-50 dark:bg-green-900/30 hover:no-underline">
                      <div className="flex flex-1 justify-between items-center">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                            {task.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        </div>
                        <Badge className="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" /> Completed
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="mr-1 h-4 w-4" />
                          <span>Submitted on: {new Date(submission.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm font-medium dark:text-white">
                          <span>
                            Score: {submission.totalScore} / {task.mcqs.length + task.codingQuestions.length}
                          </span>
                        </div>

                        <div className="mt-4">
                          <Link href={`/dashboard/tasks/results/${task._id}`}>
                            <div className="w-full py-2 px-4 rounded-md text-center text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70">
                              View Results
                            </div>
                          </Link>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="expired">
          {expiredTasks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">No expired tasks. You're doing great at keeping up with deadlines!</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {expiredTasks.map((task) => (
                <AccordionItem
                  key={task._id?.toString()}
                  value={`task-${task._id}`}
                  className="border border-red-300 dark:border-red-700 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 bg-red-50 dark:bg-red-900/30 hover:no-underline">
                    <div className="flex flex-1 justify-between items-center">
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                      </div>
                      <Badge variant="destructive" className="dark:bg-red-700 dark:hover:bg-red-600">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Expired
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center">
                          <FileQuestion className="mr-1 h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span>MCQs: {task.mcqs.length}</span>
                        </div>
                        <div className="flex items-center">
                          <Code className="mr-1 h-4 w-4 text-green-600 dark:text-green-400" />
                          <span>Coding: {task.codingQuestions.length}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        <span>This task can no longer be submitted</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
