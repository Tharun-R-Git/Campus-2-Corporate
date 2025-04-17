import { type NextRequest, NextResponse } from "next/server"
import { getAllWeeklyTasks } from "@/lib/db-utils"
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

    const tasks = await getAllWeeklyTasks(category)

    return NextResponse.json(tasks, { status: 200 })
  } catch (error) {
    console.error("Tasks fetch error:", error)
    return NextResponse.json({ error: "An error occurred while fetching tasks" }, { status: 500 })
  }
}
