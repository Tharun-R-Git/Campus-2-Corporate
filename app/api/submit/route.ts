import { type NextRequest, NextResponse } from "next/server"
import { createSubmission, getTaskById, updateStudentProgress, findUserByEmail } from "@/lib/db-utils"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

const submissionSchema = z.object({
  taskId: z.string(),
  week: z.number(),
  category: z.string(),
  mcqAnswers: z.array(z.number()),
  codingSolutions: z.array(z.string()),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "student") {
      return NextResponse.json({ error: "Only students can submit tasks" }, { status: 403 })
    }

    const body = await req.json()
    const validation = submissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 })
    }

    const { taskId, week, category, mcqAnswers, codingSolutions } = validation.data

    // Get the student to determine their category
    const user = await findUserByEmail(session.user.email)
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 400 })
    }

    // Verify that the category matches the student's selected category
    if (user.category !== category) {
      return NextResponse.json({ error: "Category mismatch" }, { status: 400 })
    }

    // Get the task to evaluate MCQs
    const task = await getTaskById(taskId)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Evaluate MCQs
    let mcqScore = 0
    task.mcqs.forEach((mcq, index) => {
      if (mcqAnswers[index] === mcq.correctAnswer) {
        mcqScore++
      }
    })

    // Evaluate coding solutions using Gemini
    let codingScore = 0
    const codingFeedback = []

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    for (let i = 0; i < task.codingQuestions.length; i++) {
      const question = task.codingQuestions[i]
      const solution = codingSolutions[i]

      // Skip if no solution provided
      if (!solution) continue

      // Construct the prompt for evaluation
      const prompt = `
        You are an automated code evaluator. Evaluate the following code solution for correctness:
        
        Problem: ${question.question}
        Description: ${question.description}
        
        Test Cases:
        ${question.testCases.map((tc) => `Input: ${tc.input}, Expected Output: ${tc.expectedOutput}`).join("\n")}
        
        Student's solution:
        \`\`\`
        ${solution}
        \`\`\`
        
        Evaluate if the solution correctly solves the problem and passes all test cases.
        Return a JSON object with the following structure:
        {
          "score": number between 0 and 1 (0 for completely incorrect, 1 for perfect),
          "feedback": string explaining the evaluation,
          "passesAllTests": boolean,
          "performance": number between 0 and 100,
          "readability": number between 0 and 100,
          "correctness": number between 0 and 100,
          "identifiedIssues": [
            {
              "type": "performance" | "style" | "correctness",
              "severity": "low" | "medium" | "high",
              "description": string explaining the issue
            }
          ]
        }
        
        Only return the JSON object, nothing else.
      `

      try {
        // Generate evaluation
        const result = await model.generateContent(prompt)
        const response = result.response
        const evaluationText = response.text()

        // Parse the JSON response
        const evaluation = JSON.parse(evaluationText)

        // Add to score (scale from 0-1 to 0-1 per question)
        codingScore += evaluation.score

        // Store feedback
        codingFeedback.push({
          questionIndex: i,
          feedback: evaluation.feedback,
          score: evaluation.score,
          passesAllTests: evaluation.passesAllTests,
          performance: evaluation.performance || 0,
          readability: evaluation.readability || 0,
          correctness: evaluation.correctness || 0,
          identifiedIssues: evaluation.identifiedIssues || [],
        })
      } catch (error) {
        console.error(`Error evaluating coding question ${i}:`, error)
        // Default to partial credit if evaluation fails
        codingScore += 0.5
        codingFeedback.push({
          questionIndex: i,
          feedback: "Error during automated evaluation. Partial credit awarded.",
          score: 0.5,
          passesAllTests: false,
          performance: 50,
          readability: 50,
          correctness: 50,
          identifiedIssues: [],
        })
      }
    }

    // Round the coding score to nearest integer
    codingScore = Math.round(codingScore)

    const totalScore = mcqScore + codingScore

    // Create submission
    const submission = await createSubmission({
      studentId: new ObjectId(session.user.id),
      taskId: new ObjectId(taskId),
      week,
      category,
      submissionDate: new Date(),
      mcqAnswers,
      codingSolutions,
      mcqScore,
      codingScore,
      totalScore,
      evaluated: true,
      codingFeedback,
    })

    // Update student progress
    await updateStudentProgress(session.user.id, week, totalScore, category)

    return NextResponse.json(
      {
        message: "Submission successful",
        submission: {
          mcqScore,
          codingScore,
          totalScore,
          codingFeedback,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "An error occurred during submission" }, { status: 500 })
  }
}
