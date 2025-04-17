"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface MarkResourceButtonProps {
  weekNumber: number
  resourceIndex: number
  studentId: string
  isCompleted: boolean
}

export function MarkResourceButton({
  weekNumber,
  resourceIndex,
  studentId,
  isCompleted,
}: MarkResourceButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleMarkResource = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/content/mark-resource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekNumber,
          resourceIndex,
          studentId,
          completed: !isCompleted,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark resource")
      }

      router.refresh()
    } catch (error) {
      console.error("Error marking resource:", error)
      toast({
        title: "Error",
        description: "Failed to mark resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleMarkResource}
      disabled={loading}
      className={
        isCompleted
          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900/70"
          : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
      }
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <>
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </>
      ) : (
        "Mark Complete"
      )}
    </Button>
  )
} 