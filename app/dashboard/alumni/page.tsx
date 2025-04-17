import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getAllAlumniExperiences } from "@/lib/db-utils"
import { AlumniExperiences } from "@/components/alumni/AlumniExperiences"

export default async function AlumniPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/login")
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    redirect("/login")
  }

  const experiences = await getAllAlumniExperiences()

  return (
    <div className="space-y-6">
      <AlumniExperiences experiences={experiences} />
    </div>
  )
} 