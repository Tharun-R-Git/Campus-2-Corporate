import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getWeeklyContent } from "@/lib/db-utils"
import type { Student } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BookOpen, FileText, Video, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MarkAsReadButton from "@/components/mark-as-read-button"

interface WeekContentPageProps {
  params: {
    week: string
  }
}

export default async function WeekContentPage({ params }: WeekContentPageProps) {
  const { week } = params
  const weekNumber = Number.parseInt(week)

  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const user = await findUserByEmail(session.user.email)

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student") {
    redirect("/dashboard")
  }

  const student = user as Student

  if (!student.category) {
    redirect("/dashboard/content")
  }

  // Fetch content for the specific week and category
  const content = await getWeeklyContent(student.category, weekNumber)

  if (!content) {
    redirect("/dashboard/content")
  }

  // Check if this content is marked as completed
  const isCompleted = student.progress?.completedContent?.includes(weekNumber) || false

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/dashboard/content" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Learning Content
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800">Week {weekNumber} Content</h1>
          <p className="text-gray-600">{content.title}</p>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
              <CheckCircle className="mr-2 h-5 w-5" />
              <span className="font-medium">Marked as Complete</span>
            </div>
          ) : (
            <MarkAsReadButton weekNumber={weekNumber} studentId={session.user.id} />
          )}
        </div>
      </div>

      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-blue-800">Description</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p>{content.description}</p>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-sm">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-blue-800">Learning Resources</CardTitle>
          <CardDescription>Study materials for this week</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {content.resources.map((resource, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-blue-100 last:border-0">
                <AccordionTrigger className="hover:text-blue-700 py-4">
                  <div className="flex items-center gap-2">
                    {resource.type === "video" && <Video className="h-5 w-5 text-red-500" />}
                    {resource.type === "notes" && <FileText className="h-5 w-5 text-green-500" />}
                    {resource.type === "link" && <BookOpen className="h-5 w-5 text-blue-500" />}
                    <span className="font-medium">{resource.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-700">
                      {resource.type === "video" && "Watch this video to learn more about the topic."}
                      {resource.type === "notes" && "Download these notes for reference."}
                      {resource.type === "link" && "Visit this link for additional information."}
                    </p>
                    <Link
                      href={resource.url}
                      target="_blank"
                      className="inline-block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {resource.type === "video" && "Watch Video"}
                      {resource.type === "notes" && "View Notes"}
                      {resource.type === "link" && "Open Link"}
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/dashboard/content">
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Content
          </Button>
        </Link>
        <Link href={`/dashboard/tasks/${weekNumber}`}>
          <Button className="bg-blue-600 hover:bg-blue-700">Go to Week {weekNumber} Tasks</Button>
        </Link>
      </div>
    </div>
  )
}
