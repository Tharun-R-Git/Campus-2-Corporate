import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getTaskById, getStudentSubmission } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle, ArrowLeft, Code, FileQuestion } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ThemeToggle } from "@/components/theme-toggle"

interface ResultsPageProps {
  params: {
    taskId: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
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

  // Get the submission
  const submission = await getStudentSubmission(session.user.id, taskId)

  if (!submission) {
    redirect("/dashboard/tasks")
  }

  // Get the task
  const task = await getTaskById(taskId)

  if (!task) {
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
          <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Task Results</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {task.title} - Week {task.week}
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
        <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
          <CardTitle className="text-blue-800 dark:text-blue-300">Submission Summary</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Submitted on {new Date(submission.submissionDate).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 dark:bg-gray-900">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">MCQ Score</p>
              <div className="text-2xl font-bold dark:text-white">
                {submission.mcqScore} / {task.mcqs.length}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Coding Score</p>
              <div className="text-2xl font-bold dark:text-white">
                {submission.codingScore} / {task.codingQuestions.length}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Score</p>
              <div className="text-2xl font-bold dark:text-white">
                {submission.totalScore} / {task.mcqs.length + task.codingQuestions.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mcq">
        <TabsList className="bg-blue-50 dark:bg-blue-900/50 p-1 border border-blue-100 dark:border-blue-800">
          <TabsTrigger
            value="mcq"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            <FileQuestion className="h-4 w-4 mr-2" />
            MCQ Results
          </TabsTrigger>
          <TabsTrigger
            value="coding"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            <Code className="h-4 w-4 mr-2" />
            Coding Results
          </TabsTrigger>
        </TabsList>
        <TabsContent value="mcq" className="space-y-4 mt-4">
          <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
              <CardTitle className="text-blue-800 dark:text-blue-300">Multiple Choice Questions</CardTitle>
              <CardDescription className="dark:text-gray-400">Your answers and correct solutions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900">
              <div className="space-y-6">
                {task.mcqs.map((question, index) => {
                  const userAnswer = submission.mcqAnswers[index]
                  const isCorrect = userAnswer === question.correctAnswer

                  return (
                    <div key={index} className="pb-6 border-b dark:border-gray-700 last:border-0">
                      <div className="flex items-start gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-1 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-1 flex-shrink-0" />
                        )}
                        <div className="space-y-1">
                          <h3 className="font-medium dark:text-white">Question {index + 1}</h3>
                          <p className="dark:text-gray-300">{question.question}</p>
                          <div className="mt-2 space-y-1">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded-md ${
                                  userAnswer === optionIndex
                                    ? isCorrect
                                      ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                                      : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                                    : question.correctAnswer === optionIndex
                                      ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                                      : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="mr-2 dark:text-white">{String.fromCharCode(65 + optionIndex)}.</span>
                                  <span className="dark:text-white">{option}</span>
                                  {userAnswer === optionIndex && (
                                    <Badge className="ml-auto dark:bg-gray-700 dark:text-white">Your Answer</Badge>
                                  )}
                                  {question.correctAnswer === optionIndex && (
                                    <Badge className="ml-auto bg-green-500 dark:bg-green-700">Correct Answer</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coding" className="space-y-4 mt-4">
          <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
              <CardTitle className="text-blue-800 dark:text-blue-300">Coding Questions</CardTitle>
              <CardDescription className="dark:text-gray-400">Your solutions and feedback</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 dark:bg-gray-900">
              <div className="space-y-6">
                {task.codingQuestions.map((question, index) => {
                  const solution = submission.codingSolutions[index]
                  const feedback = submission.codingFeedback?.[index]

                  return (
                    <div key={index} className="pb-6 border-b dark:border-gray-700 last:border-0">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium dark:text-white">Question {index + 1}</h3>
                          <p className="dark:text-gray-300">{question.question}</p>
                          <div className="mt-2 p-4 bg-muted dark:bg-gray-800 rounded-md">
                            <p className="whitespace-pre-wrap font-mono text-sm dark:text-gray-300">
                              {question.description}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium dark:text-white">Your Solution</h4>
                          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                            <pre className="whitespace-pre-wrap font-mono text-sm dark:text-gray-300">
                              {solution || "No solution submitted"}
                            </pre>
                          </div>
                        </div>

                        {feedback && (
                          <>
                            <div className="grid grid-cols-4 gap-4">
                              <div className="col-span-4 md:col-span-1">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                    {Math.round(feedback.score * 100)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
                                </div>
                              </div>
                              {feedback.readability !== undefined && (
                                <div className="col-span-4 md:col-span-1">
                                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                                      {feedback.readability}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Readability</div>
                                    <Progress value={feedback.readability} className="h-1 mt-2" />
                                  </div>
                                </div>
                              )}
                              {feedback.performance !== undefined && (
                                <div className="col-span-4 md:col-span-1">
                                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                                      {feedback.performance}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Performance</div>
                                    <Progress
                                      value={feedback.performance}
                                      className="h-1 mt-2 bg-gray-200 dark:bg-gray-700"
                                    >
                                      <div
                                        className="h-full bg-yellow-500 dark:bg-yellow-600 rounded-full"
                                        style={{ width: `${feedback.performance}%` }}
                                      ></div>
                                    </Progress>
                                  </div>
                                </div>
                              )}
                              {feedback.correctness !== undefined && (
                                <div className="col-span-4 md:col-span-1">
                                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                      {feedback.correctness}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Correctness</div>
                                    <Progress
                                      value={feedback.correctness}
                                      className="h-1 mt-2 bg-gray-200 dark:bg-gray-700"
                                    >
                                      <div
                                        className="h-full bg-blue-500 dark:bg-blue-600 rounded-full"
                                        style={{ width: `${feedback.correctness}%` }}
                                      ></div>
                                    </Progress>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium dark:text-white">Analysis Feedback</h4>
                              <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                                <p className="whitespace-pre-wrap text-sm dark:text-gray-300">{feedback.feedback}</p>
                              </div>
                            </div>

                            {feedback.identifiedIssues && feedback.identifiedIssues.length > 0 && (
                              <div>
                                <h4 className="font-medium dark:text-white">Identified Issues</h4>
                                <div className="mt-2 space-y-3">
                                  {feedback.identifiedIssues.map((issue, issueIndex) => (
                                    <div
                                      key={issueIndex}
                                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700"
                                    >
                                      <div className="flex justify-between items-center mb-2">
                                        <div className="font-medium capitalize dark:text-white">{issue.type}</div>
                                        <Badge
                                          className={
                                            issue.severity === "low"
                                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                              : issue.severity === "medium"
                                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                          }
                                        >
                                          {issue.severity}
                                        </Badge>
                                      </div>
                                      <p className="text-sm dark:text-gray-300">{issue.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Link href="/dashboard/tasks">
          <Button
            variant="outline"
            className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>
        <Link href="/dashboard/progress">
          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">
            View Overall Progress
          </Button>
        </Link>
      </div>
    </div>
  )
}
