import { type NextRequest, NextResponse } from "next/server"
import { createUser, findUserByEmail } from "@/lib/db-utils"
import { z } from "zod"
import type { Student, Alumni } from "@/lib/models"

// Base user schema
const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "alumni"]),
})

// Student schema
const studentSchema = baseUserSchema.extend({
  role: z.literal("student"),
  rollNumber: z.string().regex(/^22[A-Z]{3}\d{4}$/, "Invalid Roll Number format"),
  branch: z.string().min(1, "Branch is required"),
  school: z.string().min(1, "School is required"),
  cgpa: z.string().min(1, "CGPA is required"),
})

// Alumni schema
const alumniSchema = baseUserSchema.extend({
  role: z.literal("alumni"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  graduationYear: z.number().min(1900).max(new Date().getFullYear()),
})

// Combined schema
const userSchema = z.discriminatedUnion("role", [studentSchema, alumniSchema])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = userSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const data = validation.data

    // Check if user already exists
    const existingUser = await findUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Create new user with role-specific fields
    const newUser = await createUser(data)

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          ...(newUser.role === "student" && {
            rollNumber: newUser.rollNumber,
            branch: newUser.branch,
            school: newUser.school,
            cgpa: newUser.cgpa,
          }),
          ...(newUser.role === "alumni" && {
            company: newUser.company,
            position: newUser.position,
            graduationYear: newUser.graduationYear,
          }),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
