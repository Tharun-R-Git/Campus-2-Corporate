import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { findUserByEmail } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CategorySelection from "@/components/category-selection"
import { Progress } from "@/components/ui/progress"
import { User, GraduationCap, CheckSquare, PieChart, Mail, GraduationCap as GradCap, Building2, Briefcase, Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Student, Alumni } from "@/lib/models"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Not logged in</h1>
          <p className="text-gray-600">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">User not found</h1>
          <p className="text-gray-600">Please try logging in again</p>
        </div>
      </div>
    )
  }

  let contentCompletionPercentage = 0
  let tasksCompletionPercentage = 0
  let totalPoints = 0

  if (user.role === "student") {
    const student = user as Student
    if (student.progress) {
      const totalWeeks = 12
      const completedContent = student.progress.completedContent?.length || 0
      contentCompletionPercentage = Math.round((completedContent / totalWeeks) * 100)
      tasksCompletionPercentage = Math.round((student.progress.completedTasks / totalWeeks) * 100)
      totalPoints = Object.entries(student.progress.weeklyScores || {}).reduce((sum, [_, score]) => {
        return sum + (typeof score === 'number' ? score : 0)
      }, 0)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">View your profile information</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid gap-6">
        <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <CardTitle className="text-blue-800 dark:text-blue-300">Personal Information</CardTitle>
                <CardDescription className="dark:text-gray-400">Your account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 dark:bg-gray-900">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Name: {user.name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">Email: {user.email}</span>
              </div>
              {user.role === "student" && (
                <>
                  <div className="flex items-center">
                    <GradCap className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Roll Number: {(user as Student).rollNumber || "Not set"}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Branch: {(user as Student).branch || "Not set"}</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">School: {(user as Student).school || "Not set"}</span>
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">CGPA: {(user as Student).cgpa || "Not set"}</span>
                  </div>
                </>
              )}
              {user.role === "alumni" && (
                <>
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Company: {(user as Alumni).company || "Not set"}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Position: {(user as Alumni).position || "Not set"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Graduation Year: {(user as Alumni).graduationYear || "Not set"}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {user.role === "student" && (
          <>
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                    <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <CardTitle className="text-blue-800 dark:text-blue-300">Preparation Category</CardTitle>
                    <CardDescription className="dark:text-gray-400">
                      {(user as Student).category
                        ? "Your selected preparation path"
                        : "Select your preparation category to get started"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 dark:bg-gray-900">
                <CategorySelection currentCategory={(user as Student).category} />
              </CardContent>
            </Card>

            {(user as Student).category && (
              <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center mr-3">
                      <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <CardTitle className="text-blue-800 dark:text-blue-300">Progress Summary</CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Your current progress in {(user as Student).category}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 dark:bg-gray-900">
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium dark:text-white">Content Completion</h3>
                        <span className="text-sm font-medium dark:text-white">{contentCompletionPercentage}%</span>
                      </div>
                      <Progress value={contentCompletionPercentage} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium dark:text-white">Tasks Completion</h3>
                        <span className="text-sm font-medium dark:text-white">{tasksCompletionPercentage}%</span>
                      </div>
                      <Progress value={tasksCompletionPercentage} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-2">
                          <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium dark:text-white">Total Points Earned</span>
                      </div>
                      <span className="text-xl font-bold text-blue-800 dark:text-blue-300">{totalPoints}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
