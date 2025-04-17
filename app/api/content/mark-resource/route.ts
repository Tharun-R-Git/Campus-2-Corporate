import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { markResourceCompletion } from "@/lib/db-utils"
import { z } from "zod"

const markResourceSchema = z.object({
  weekNumber: z.number(),
  resourceIndex: z.number(),
  studentId: z.string(),
  completed: z.boolean(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Only students can mark resources as completed" }, { status: 403 })
    }

    const body = await req.json()
    const validation = markResourceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { weekNumber, resourceIndex, studentId, completed } = validation.data

    // Verify that the student ID matches the session user ID
    if (studentId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await markResourceCompletion(studentId, weekNumber, resourceIndex, completed)

    return NextResponse.json({ message: "Resource marked as completed" }, { status: 200 })
  } catch (error) {
    console.error("Error marking resource as completed:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
