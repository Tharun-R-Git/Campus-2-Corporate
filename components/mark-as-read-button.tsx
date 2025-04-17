"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface MarkAsReadButtonProps {
  weekNumber: number
  studentId: string
}

export default function MarkAsReadButton({ weekNumber, studentId }: MarkAsReadButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkAsRead = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/content/mark-completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weekNumber,
          studentId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to mark content as read")
      }

      toast({
        title: "Success",
        description: `Week ${weekNumber} content marked as complete`,
        variant: "default",
      })

      router.refresh()
    } catch (error) {
      console.error("Error marking content as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark content as read. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleMarkAsRead} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Marking as Complete...
        </>
      ) : (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  )
}
