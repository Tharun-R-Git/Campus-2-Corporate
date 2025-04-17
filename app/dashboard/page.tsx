import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle, GraduationCap, PieChart, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import CategorySelection from "@/components/category-selection"
import { Progress } from "@/components/ui/progress"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    redirect("/login")
  }

  const isStudent = user.role === "student"
  const student = user as Student
  const hasCategory = isStudent && student.category

  // Calculate completion percentages for students
  let contentCompletionPercentage = 0
  let tasksCompletionPercentage = 0
  let totalPoints = 0

  if (isStudent && student.progress) {
    const totalWeeks = 12 // Assuming 12 weeks in total
    const completedContent = student.progress.completedContent?.length || 0
    contentCompletionPercentage = Math.round((completedContent / totalWeeks) * 100)

    tasksCompletionPercentage = Math.round((student.progress.completedTasks / totalWeeks) * 100)

    // Calculate total points from weekly scores
    totalPoints = Object.values(student.progress.weeklyScores).reduce((sum, score) => sum + score, 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {isStudent && !hasCategory && (
        <Card className="border-blue-200 shadow-sm">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-blue-800">Select Your Preparation Category</CardTitle>
            <CardDescription>Choose a category to get started with your placement preparation</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CategorySelection />
          </CardContent>
        </Card>
      )}

      {isStudent && hasCategory && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-sm font-medium text-blue-800">Learning Content</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{contentCompletionPercentage}%</div>
                  <Progress value={contentCompletionPercentage} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {student.progress?.completedContent?.length || 0} of 12 weeks completed
                  </p>
                  <div className="pt-2">
                    <Link href="/dashboard/content">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        View Content
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-sm font-medium text-blue-800">Weekly Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{tasksCompletionPercentage}%</div>
                  <Progress value={tasksCompletionPercentage} className="h-2" />
                  <p className="text-xs text-gray-500">{student.progress?.completedTasks || 0} of 12 tasks completed</p>
                  <div className="pt-2">
                    <Link href="/dashboard/tasks">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        View Tasks
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-sm font-medium text-blue-800">Progress</CardTitle>
                <PieChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{totalPoints} points</div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{ width: `${Math.min(totalPoints / 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Total points earned across all tasks</p>
                  <div className="pt-2">
                    <Link href="/dashboard/progress">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        View Progress
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
                <CardTitle className="text-sm font-medium text-blue-800">Alumni Experiences</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">Placement Insights</div>
                  <p className="text-xs text-gray-500">Learn from alumni experiences and interview processes</p>
                  <div className="pt-2">
                    <Link href="/dashboard/experiences">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        View Experiences
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800">Your Progress in {student.category}</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Learning Content</h3>
                      <p className="text-sm text-gray-500">Complete weekly learning materials</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{contentCompletionPercentage}%</div>
                    <p className="text-xs text-gray-500">
                      {student.progress?.completedContent?.length || 0} of 12 weeks
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Weekly Tasks</h3>
                      <p className="text-sm text-gray-500">Complete MCQs and coding assignments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{tasksCompletionPercentage}%</div>
                    <p className="text-xs text-gray-500">{student.progress?.completedTasks || 0} of 12 tasks</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <PieChart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Total Points</h3>
                      <p className="text-sm text-gray-500">Points earned from all submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{totalPoints} points</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!isStudent && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-800">Share Your Experience</CardTitle>
                  <CardDescription>Help Current Students</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                Share your placement journey to guide current students in their preparation. Your insights can make a
                significant difference in their career paths.
              </p>
              <Link href="/dashboard/share-experience">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Share Experience</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-blue-800">Your Profile</CardTitle>
                  <CardDescription>Manage Account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 mb-4">
                Update your profile information and manage your account settings. Keep your details current to stay
                connected with the community.
              </p>
              <Link href="/dashboard/profile">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">View Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
