import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { code, question } = body

    if (!code || !question) {
      return NextResponse.json({ error: "Code and question are required" }, { status: 400 })
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Construct the prompt
    const prompt = `
      You are a coding instructor evaluating a student's solution to the following problem:
      
      Problem: ${question}
      
      Student's solution:
      \`\`\`
      ${code}
      \`\`\`
      
      Please evaluate the code and provide feedback on:
      1. Correctness: Does the code solve the problem correctly?
      2. Efficiency: Is the solution efficient? What's the time and space complexity?
      3. Code quality: Is the code well-structured, readable, and following best practices?
      4. Suggestions for improvement
      
      Format your response in a clear, concise manner that would be helpful for a student.
    `

    // Generate content
    const result = await model.generateContent(prompt)
    const response = result.response
    const evaluation = response.text()

    return NextResponse.json({ evaluation }, { status: 200 })
  } catch (error) {
    console.error("Code evaluation error:", error)
    return NextResponse.json({ error: "An error occurred during code evaluation" }, { status: 500 })
  }
}
