import { type NextRequest, NextResponse } from "next/server"
import { getAllWeeklyContent } from "@/lib/db-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const category = url.searchParams.get("category")

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 })
    }

    const content = await getAllWeeklyContent(category)

    return NextResponse.json(content, { status: 200 })
  } catch (error) {
    console.error("Content fetch error:", error)
    return NextResponse.json({ error: "An error occurred while fetching content" }, { status: 500 })
  }
}
