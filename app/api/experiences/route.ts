import { type NextRequest, NextResponse } from "next/server"
import { createPlacementExperience, getPlacementExperiences, getPlacementExperiencesByCompany } from "@/lib/db-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { z } from "zod"

const experienceSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  package: z.string().optional(),
  yearOfPlacement: z.number(),
  experience: z.string().min(10, "Experience must be at least 10 characters"),
  interviewProcess: z.string().min(10, "Interview process must be at least 10 characters"),
  tips: z.string().min(10, "Tips must be at least 10 characters"),
})

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const company = url.searchParams.get("company")

    let experiences
    if (company) {
      experiences = await getPlacementExperiencesByCompany(company)
    } else {
      experiences = await getPlacementExperiences()
    }

    return NextResponse.json(experiences, { status: 200 })
  } catch (error) {
    console.error("Experiences fetch error:", error)
    return NextResponse.json({ error: "An error occurred while fetching experiences" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "alumni") {
      return NextResponse.json({ error: "Only alumni can share experiences" }, { status: 403 })
    }

    const body = await req.json()
    const validation = experienceSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const experience = await createPlacementExperience({
      alumniId: new ObjectId(session.user.id),
      alumniName: session.user.name,
      ...validation.data,
    })

    return NextResponse.json(
      {
        message: "Experience shared successfully",
        experience,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Experience sharing error:", error)
    return NextResponse.json({ error: "An error occurred while sharing experience" }, { status: 500 })
  }
}
