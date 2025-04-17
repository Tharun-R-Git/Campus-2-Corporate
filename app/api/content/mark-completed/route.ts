import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { updateContentCompletion } from "@/lib/db-utils"
import { z } from "zod"

const markCompletedSchema = z.object({
  weekNumber: z.number(),
  studentId: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Only students can mark content as completed" }, { status: 403 })
    }

    const body = await req.json()
    const validation = markCompletedSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { weekNumber, studentId } = validation.data

    // Verify that the student ID matches the session user ID
    if (studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await updateContentCompletion(studentId, weekNumber, true)

    return NextResponse.json({ message: "Content marked as completed" }, { status: 200 })
  } catch (error) {
    console.error("Error marking content as completed:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
