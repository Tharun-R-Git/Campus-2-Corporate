import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getStudentSubmissions } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import CategorySelection from "@/components/category-selection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart, TrendingUp } from "lucide-react"

export default async function ProgressPage() {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800">Progress & Performance</h1>
          <p className="text-gray-600">Monitor your learning progress</p>
        </div>

        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-blue-800">Select Your Preparation Category</CardTitle>
            <CardDescription>You need to select a category to track your progress</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CategorySelection currentCategory={student.category} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch student submissions
  const submissions = await getStudentSubmissions(session.user.id)

  // Calculate progress metrics
  const totalSubmissions = submissions.length
  const totalMcqScore = submissions.reduce((sum, submission) => sum + (submission.mcqScore || 0), 0)
  const totalCodingScore = submissions.reduce((sum, submission) => sum + (submission.codingScore || 0), 0)
  const totalScore = submissions.reduce((sum, submission) => sum + (submission.totalScore || 0), 0)

  // Group submissions by week
  const submissionsByWeek = submissions.reduce(
    (acc, submission) => {
      const week = submission.week
      if (!acc[week]) {
        acc[week] = []
      }
      acc[week].push(submission)
      return acc
    },
    {} as Record<number, typeof submissions>,
  )

  const weeks = Object.keys(submissionsByWeek)
    .map(Number)
    .sort((a, b) => a - b)

  // Calculate completion percentage (assuming 12 weeks in total)
  const totalWeeks = 12
  const completedWeeks = student.progress?.completedContent?.length || 0
  const completionPercentage = Math.round((completedWeeks / totalWeeks) * 100)

  // Calculate task completion percentage
  const totalTasks = 12 // Assuming 12 tasks in total
  const tasksCompletionPercentage = Math.round((totalSubmissions / totalTasks) * 100)

  // Calculate average scores
  const avgMcqScore = totalSubmissions > 0 ? Math.round((totalMcqScore / totalSubmissions) * 10) / 10 : 0
  const avgCodingScore = totalSubmissions > 0 ? Math.round((totalCodingScore / totalSubmissions) * 10) / 10 : 0
  const avgTotalScore = totalSubmissions > 0 ? Math.round((totalScore / totalSubmissions) * 10) / 10 : 0

  // Prepare data for charts
  const weeklyScores = weeks.map((week) => {
    const weekSubmissions = submissionsByWeek[week]
    const weekTotalScore = weekSubmissions.reduce((sum, submission) => sum + (submission.totalScore || 0), 0)
    const weekMcqScore = weekSubmissions.reduce((sum, submission) => sum + (submission.mcqScore || 0), 0)
    const weekCodingScore = weekSubmissions.reduce((sum, submission) => sum + (submission.codingScore || 0), 0)

    return {
      week,
      totalScore: weekTotalScore,
      mcqScore: weekMcqScore,
      codingScore: weekCodingScore,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Progress & Performance</h1>
        <p className="text-gray-600">Monitor your learning progress for {student.category}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800">Content Completion</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {completedWeeks} of {totalWeeks} weeks completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800">Tasks Completion</CardTitle>
            <BarChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{tasksCompletionPercentage}%</div>
            <Progress value={tasksCompletionPercentage} className="mt-2 h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {totalSubmissions} of {totalTasks} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgTotalScore} points</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>MCQ: {avgMcqScore} pts</div>
              <div>Coding: {avgCodingScore} pts</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium text-blue-800">Total Score</CardTitle>
            <LineChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalScore} points</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <div>MCQ: {totalMcqScore} pts</div>
              <div>Coding: {totalCodingScore} pts</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList className="bg-blue-50 p-1 border border-blue-100">
          <TabsTrigger
            value="weekly"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Weekly Performance
          </TabsTrigger>
          <TabsTrigger
            value="trend"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
          >
            <LineChart className="h-4 w-4 mr-2" />
            Performance Trend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Weekly Performance</CardTitle>
              <CardDescription>Your scores for each completed week</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {weeks.length === 0 ? (
                <p>No submissions yet. Complete some weekly tasks to see your performance.</p>
              ) : (
                <div className="space-y-6">
                  {weeklyScores.map((weekData) => {
                    const totalPossibleScore = 10 // Adjust based on your scoring system
                    const mcqPercentage = (weekData.mcqScore / totalPossibleScore) * 100
                    const codingPercentage = (weekData.codingScore / totalPossibleScore) * 100

                    return (
                      <div key={weekData.week} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                        <h3 className="font-medium mb-3 text-blue-800">Week {weekData.week}</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">MCQ Score: {weekData.mcqScore} points</span>
                              <span className="text-sm font-medium">{Math.round(mcqPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${mcqPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">Coding Score: {weekData.codingScore} points</span>
                              <span className="text-sm font-medium">{Math.round(codingPercentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-green-600 h-2.5 rounded-full"
                                style={{ width: `${codingPercentage}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-blue-800">
                                Total: {weekData.totalScore} points
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Performance Trend</CardTitle>
              <CardDescription>Your progress over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {weeks.length < 2 ? (
                <p>Complete at least two weeks of tasks to see your performance trend.</p>
              ) : (
                <div className="h-80 w-full">
                  <div className="flex h-full items-end">
                    {weeklyScores.map((weekData, index) => {
                      const maxScore = 10 // Adjust based on your scoring system
                      const mcqHeight = (weekData.mcqScore / maxScore) * 100
                      const codingHeight = (weekData.codingScore / maxScore) * 100

                      return (
                        <div key={weekData.week} className="flex-1 flex flex-col items-center">
                          <div className="w-full flex justify-center items-end h-64 space-x-1">
                            <div className="w-5 bg-blue-600 rounded-t" style={{ height: `${mcqHeight}%` }}></div>
                            <div className="w-5 bg-green-600 rounded-t" style={{ height: `${codingHeight}%` }}></div>
                          </div>
                          <div className="mt-2 text-xs">Week {weekData.week}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex justify-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded mr-1"></div>
                  <span className="text-xs">MCQ Score</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded mr-1"></div>
                  <span className="text-xs">Coding Score</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
