import { type NextRequest, NextResponse } from "next/server"
import { updateStudentCategory, resetStudentProgress } from "@/lib/db-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

const categorySchema = z.object({
  category: z.enum(["Dream Package", "Super Dream Package", "Higher Studies"]),
  resetProgress: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Only students can select a category" }, { status: 403 })
    }

    const body = await req.json()
    const validation = categorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { category, resetProgress } = validation.data

    // If resetProgress is true, reset the student's progress
    if (resetProgress) {
      await resetStudentProgress(session.user.id)
    }

    await updateStudentCategory(session.user.id, category)

    return NextResponse.json({ message: "Category updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Category update error:", error)
    return NextResponse.json({ error: "An error occurred while updating category" }, { status: 500 })
  }
}
