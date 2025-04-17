import { type NextRequest, NextResponse } from "next/server"
import { updateUserProfile } from "@/lib/db-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { z } from "zod"

// Base profile schema
const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

// Student profile schema
const studentProfileSchema = baseProfileSchema.extend({
  role: z.literal("student"),
  rollNumber: z.string().regex(/^22[A-Z]{3}\d{4}$/, "Invalid Roll Number format"),
  branch: z.string().min(1, "Branch is required"),
  school: z.string().min(1, "School is required"),
  cgpa: z.string().min(1, "CGPA is required"),
})

// Alumni profile schema
const alumniProfileSchema = baseProfileSchema.extend({
  role: z.literal("alumni"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  graduationYear: z.number().min(1900).max(new Date().getFullYear()),
})

// Combined profile schema
const profileSchema = z.discriminatedUnion("role", [
  studentProfileSchema,
  alumniProfileSchema,
])

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = profileSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const data = validation.data

    // Verify that the user is updating their own role type
    if (data.role !== session.user.role) {
      return NextResponse.json({ error: "Cannot change user role" }, { status: 403 })
    }

    await updateUserProfile(session.user.id, data)

    return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "An error occurred while updating profile" }, { status: 500 })
  }
}
