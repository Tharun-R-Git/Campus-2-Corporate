import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CategorySelection from "@/components/category-selection"
import { GraduationCap, Briefcase } from "lucide-react"

export default async function CategoryPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-800">Category Selection</h1>
        <p className="text-gray-600">Choose your preparation path</p>
      </div>

      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-blue-800">Select Your Preparation Category</CardTitle>
          <CardDescription>
            {student.category
              ? "You can change your category if needed"
              : "Choose a category to get started with your placement preparation"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Select the category that best aligns with your career goals. This will determine the learning content and
              tasks you'll receive.
            </p>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-blue-800">Dream Package</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Prepare for roles at top tech companies with competitive packages.
                </p>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-blue-800">Super Dream Package</h3>
                </div>
                <p className="text-sm text-gray-600">Target elite positions at industry-leading organizations.</p>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-medium text-blue-800">Higher Studies</h3>
                </div>
                <p className="text-sm text-gray-600">Prepare for graduate programs and entrance exams.</p>
              </div>
            </div>
          </div>
          <CategorySelection currentCategory={student.category} />
        </CardContent>
      </Card>
    </div>
  )
}
