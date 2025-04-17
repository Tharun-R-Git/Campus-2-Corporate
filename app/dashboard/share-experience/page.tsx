import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail } from "@/lib/db-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ExperienceForm from "@/components/experience-form"

export default async function ShareExperiencePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "alumni") {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Share Your Experience</h1>
        <p className="text-muted-foreground">Help current students by sharing your placement journey</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Placement Experience</CardTitle>
          <CardDescription>Share details about your interview process and tips for students</CardDescription>
        </CardHeader>
        <CardContent>
          <ExperienceForm />
        </CardContent>
      </Card>
    </div>
  )
}
