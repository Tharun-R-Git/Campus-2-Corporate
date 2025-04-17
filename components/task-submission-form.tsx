"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import type { WeeklyTask } from "@/lib/models"
import { Loader2 } from "lucide-react"

interface TaskSubmissionFormProps {
  task: WeeklyTask
  studentId: string
  isCoding?: boolean
}

export default function TaskSubmissionForm({ task, studentId, isCoding = false }: TaskSubmissionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [codeEvaluation, setCodeEvaluation] = useState<string | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  // Create a dynamic form schema based on the task
  const formSchema = z.object({
    ...(isCoding
      ? task.codingQuestions.reduce(
          (acc, _, index) => ({
            ...acc,
            [`coding_${index}`]: z.string().min(1, "Solution is required"),
          }),
          {},
        )
      : task.mcqs.reduce(
          (acc, _, index) => ({
            ...acc,
            [`mcq_${index}`]: z.string().min(1, "Answer is required"),
          }),
          {},
        )),
  })

  // Create default values for the form
  const defaultValues = isCoding
    ? task.codingQuestions.reduce(
        (acc, _, index) => ({
          ...acc,
          [`coding_${index}`]: "",
        }),
        {},
      )
    : task.mcqs.reduce(
        (acc, _, index) => ({
          ...acc,
          [`mcq_${index}`]: "",
        }),
        {},
      )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function evaluateCode(code: string, question: string) {
    setIsEvaluating(true)
    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          question,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to evaluate code")
      }

      const data = await response.json()
      setCodeEvaluation(data.evaluation)
    } catch (error) {
      console.error("Code evaluation error:", error)
      toast({
        title: "Evaluation failed",
        description: "Failed to evaluate your code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEvaluating(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Process form values
      let mcqAnswers: number[] = []
      let codingSolutions: string[] = []

      if (isCoding) {
        codingSolutions = task.codingQuestions.map((_, index) => values[`coding_${index}`] as string)
      } else {
        mcqAnswers = task.mcqs.map((_, index) => Number.parseInt(values[`mcq_${index}`] as string))
      }

      // Store partial submission in local storage
      if (isCoding) {
        localStorage.setItem(`coding_solutions_${task._id}`, JSON.stringify(codingSolutions))
      } else {
        localStorage.setItem(`mcq_answers_${task._id}`, JSON.stringify(mcqAnswers))
      }

      // Check if both MCQs and coding solutions are available
      const storedMcqAnswers = localStorage.getItem(`mcq_answers_${task._id}`)
      const storedCodingSolutions = localStorage.getItem(`coding_solutions_${task._id}`)

      if (storedMcqAnswers && storedCodingSolutions) {
        // Submit the complete task
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskId: task._id?.toString(),
            week: task.week,
            category: task.category,
            mcqAnswers: JSON.parse(storedMcqAnswers),
            codingSolutions: JSON.parse(storedCodingSolutions),
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to submit task")
        }

        // Clear local storage
        localStorage.removeItem(`mcq_answers_${task._id}`)
        localStorage.removeItem(`coding_solutions_${task._id}`)

        toast({
          title: "Task submitted successfully",
          description: `Your score: ${result.submission.totalScore}/${task.mcqs.length + task.codingQuestions.length}`,
        })

        router.push(`/dashboard/tasks/results/${task._id}`)
        router.refresh()
      } else {
        // Partial submission
        toast({
          title: isCoding ? "Coding solutions saved" : "MCQ answers saved",
          description: isCoding
            ? "Please complete the MCQ section to submit the task"
            : "Please complete the coding section to submit the task",
        })

        // Switch to the other tab
        if (isCoding) {
          document.querySelector('[data-value="mcq"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        } else {
          document.querySelector('[data-value="coding"]')?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
        }
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred during submission",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isCoding
          ? // Coding questions
            task.codingQuestions.map((question, index) => (
              <div key={index} className="space-y-4 pb-6 border-b dark:border-gray-700 last:border-0">
                <div>
                  <h3 className="text-lg font-medium dark:text-white">Question {index + 1}</h3>
                  <p className="mt-1 dark:text-gray-300">{question.question}</p>
                  <div className="mt-2 p-4 bg-muted dark:bg-gray-800 rounded-md">
                    <p className="whitespace-pre-wrap font-mono text-sm dark:text-gray-300">{question.description}</p>
                  </div>
                  {question.testCases.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="font-medium dark:text-white">Test Cases:</p>
                      <div className="space-y-2">
                        {question.testCases.map((testCase, testIndex) => (
                          <div key={testIndex} className="p-2 bg-muted dark:bg-gray-800 rounded-md">
                            <p className="font-mono text-sm dark:text-gray-300">Input: {testCase.input}</p>
                            <p className="font-mono text-sm dark:text-gray-300">
                              Expected Output: {testCase.expectedOutput}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name={`coding_${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-white">Your Solution</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your code here..."
                          className="font-mono h-40 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="mt-2 flex justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => evaluateCode(field.value, question.question)}
                          disabled={isEvaluating || !field.value}
                          className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700"
                        >
                          {isEvaluating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Evaluate with Gemini AI
                        </Button>
                      </div>
                      {codeEvaluation && (
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md border dark:border-gray-700">
                          <h4 className="font-medium mb-2 dark:text-white">Gemini AI Evaluation:</h4>
                          <div className="text-sm whitespace-pre-wrap dark:text-gray-300">{codeEvaluation}</div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            ))
          : // MCQ questions
            task.mcqs.map((question, index) => (
              <div key={index} className="space-y-4 pb-6 border-b dark:border-gray-700 last:border-0">
                <div>
                  <h3 className="text-lg font-medium dark:text-white">Question {index + 1}</h3>
                  <p className="mt-1 dark:text-gray-300">{question.question}</p>
                </div>
                <FormField
                  control={form.control}
                  name={`mcq_${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`option-${index}-${optionIndex}`}
                                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                              />
                              <label
                                htmlFor={`option-${index}-${optionIndex}`}
                                className="text-sm font-normal cursor-pointer dark:text-white"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isCoding ? (
            "Save Coding Solutions"
          ) : (
            "Save MCQ Answers"
          )}
        </Button>
      </form>
    </Form>
  )
}
