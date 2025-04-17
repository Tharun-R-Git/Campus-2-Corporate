import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { z } from "zod"

const analysisSchema = z.object({
  codingScore: z.number().min(0).max(50),
  mcqScores: z.array(z.number().min(0).max(10)).length(5),
  analysis: z.object({
    readability: z.number().min(0).max(100),
    performance: z.number().min(0).max(100),
    correctness: z.number().min(0).max(100),
  }),
  feedback: z.string(),
  issues: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),
})

function getMockAnalysis() {
  return {
    codingScore: 0, // Start with 0 for error cases
    mcqScores: [0, 0, 0, 0, 0], // Zero scores for error cases
    analysis: {
      readability: 0,
      performance: 0,
      correctness: 0,
    },
    feedback: "Error during code analysis. Please try again or contact support if the issue persists.\n\nPossible causes:\n- API key configuration issue\n- Network connectivity problem\n- Invalid code format",
    issues: [
      {
        type: "System Error",
        description: "The code analysis service encountered an error. This might be due to API configuration issues or network problems.",
        severity: "high",
      }
    ],
  }
}

export async function analyzeCode(code: string, language: string) {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("GEMINI_API_KEY not found in environment variables")
      throw new Error("API key not configured")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ]

    const prompt = `
      You are an expert code reviewer. Analyze the following ${language} code and provide a detailed evaluation:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Evaluate the code and provide scores in these categories:
      1. Correctness (25 points):
         - Logic correctness
         - Edge case handling
         - Input validation
      
      2. Efficiency (15 points):
         - Time complexity
         - Space complexity
         - Resource usage
      
      3. Code Quality (10 points):
         - Code organization
         - Variable naming
         - Comments and documentation
      
      Format your response as a valid JSON object with this structure:
      {
        "codingScore": number,
        "analysis": {
          "readability": number,
          "performance": number,
          "correctness": number
        },
        "feedback": "POINTS BREAKDOWN:\\n\\nCorrectness (X/25):\\n- Logic: X points\\n- Edge cases: X points\\n- Input validation: X points\\n\\nEfficiency (X/15):\\n- Time complexity: X points\\n- Space complexity: X points\\n- Resource usage: X points\\n\\nCode Quality (X/10):\\n- Organization: X points\\n- Naming: X points\\n- Documentation: X points\\n\\nTotal Coding Score: X/50\\n\\nDetailed Analysis:\\n[Your detailed analysis here]",
        "issues": [
          {
            "type": "Category",
            "description": "Detailed description",
            "severity": "low|medium|high"
          }
        ]
      }
      
      IMPORTANT: 
      - Return ONLY the JSON object, no additional text
      - Ensure all numbers are actual numbers, not strings
      - Break down points for each subcategory in the feedback
      - Include specific examples and suggestions in the detailed analysis
    `

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      },
    })

    const response = result.response
    const text = response.text()

    try {
      let jsonStr = text
      if (text.includes("```json")) {
        jsonStr = text.split("```json")[1].split("```")[0].trim()
      } else if (text.includes("```")) {
        jsonStr = text.split("```")[1].split("```")[0].trim()
      }

      const parsedData = JSON.parse(jsonStr)
      
      // Add MCQ scores - in production these would come from your MCQ evaluation system
      parsedData.mcqScores = [8, 10, 7, 10, 10]
      
      const validatedData = analysisSchema.parse(parsedData)
      return validatedData
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.error("Raw AI response:", text)
      throw new Error("Failed to parse AI response")
    }
  } catch (error) {
    console.error("Error analyzing code:", error)
    return getMockAnalysis()
  }
} 