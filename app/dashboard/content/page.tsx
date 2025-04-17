import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { findUserByEmail, getAllWeeklyContent, getStudentSubmissions } from "@/lib/db-utils"
import type { Student, WeeklyContent } from "@/lib/models"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import CategorySelection from "@/components/category-selection"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileText, Video, BookOpen } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { MarkResourceButton } from "@/components/content/MarkResourceButton"

export default async function ContentPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
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
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Learning Content</h1>
            <p className="text-gray-600 dark:text-gray-400">Access your learning materials</p>
          </div>
          <ThemeToggle />
        </div>

        <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
            <CardTitle className="text-blue-800 dark:text-blue-300">Select Your Preparation Category</CardTitle>
            <CardDescription className="dark:text-gray-400">
              You need to select a category to access learning materials
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 dark:bg-gray-900">
            <CategorySelection currentCategory={student.category} />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch weekly content for the student's category
  const weeklyContent = await getAllWeeklyContent(student.category)

  // Fetch student submissions to determine completed weeks
  const submissions = await getStudentSubmissions(session.user.id)
  const completedWeeks = new Set(submissions.map((sub) => sub.week))

  // Check for completed content from student progress
  const completedContent = new Set(student.progress?.completedContent || [])

  // Check for completed resources
  const resourceCompletions = student.progress?.resourceCompletions || {}

  // Group content by week
  const contentByWeek: Record<number, WeeklyContent[]> = {}
  weeklyContent.forEach((content) => {
    if (!contentByWeek[content.week]) {
      contentByWeek[content.week] = []
    }
    contentByWeek[content.week].push(content)
  })

  const weeks = Object.keys(contentByWeek)
    .map(Number)
    .sort((a, b) => a - b)

  // Separate completed and pending weeks
  const completedContentWeeks = weeks.filter((week) => completedContent.has(week))
  const pendingContentWeeks = weeks.filter((week) => !completedContent.has(week))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">Learning Content</h1>
          <p className="text-gray-600 dark:text-gray-400">Access your learning materials for {student.category}</p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-blue-50 dark:bg-blue-900/50 p-1 border border-blue-100 dark:border-blue-800">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Completed
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:text-blue-700 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-300 data-[state=active]:shadow-sm"
          >
            Pending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {weeks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">
                  No content available for {student.category} yet. Please check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {weeks.map((week) => {
                const content = contentByWeek[week][0]
                const isCompleted = completedContent.has(week)

                return (
                  <AccordionItem
                    key={week}
                    value={`week-${week}`}
                    className={`border ${isCompleted ? "border-green-500 dark:border-green-700" : "border-blue-200 dark:border-blue-800"} rounded-lg overflow-hidden`}
                  >
                    <AccordionTrigger
                      className={`px-6 py-4 ${isCompleted ? "bg-green-50 dark:bg-green-900/30" : "bg-blue-50 dark:bg-blue-900/30"} hover:no-underline`}
                    >
                      <div className="flex flex-1 justify-between items-center">
                        <div className="text-left">
                          <h3
                            className={`text-lg font-semibold ${isCompleted ? "text-green-800 dark:text-green-400" : "text-blue-800 dark:text-blue-400"}`}
                          >
                            Week {week}: {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{content.description}</p>
                        </div>
                        {isCompleted ? (
                          <Badge className="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" /> Completed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                          >
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        {content.resources.map((resource, index) => {
                          const resourceId = `${week}-${index}`
                          const isResourceCompleted = resourceCompletions[resourceId]

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center">
                                {resource.type === "video" && (
                                  <Video className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                                )}
                                {resource.type === "notes" && (
                                  <FileText className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" />
                                )}
                                {resource.type === "link" && (
                                  <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                                )}
                                <div>
                                  <h4 className="font-medium dark:text-white">{resource.title}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {resource.type === "video" && "25 min"}
                                    {resource.type === "notes" && "Reading material"}
                                    {resource.type === "link" && "External resource"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link href={resource.url} target="_blank">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                  >
                                    View
                                  </Button>
                                </Link>
                                <MarkResourceButton
                                  weekNumber={week}
                                  resourceIndex={index}
                                  studentId={session.user.id}
                                  isCompleted={isResourceCompleted}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedContentWeeks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">
                  You haven't completed any content yet. Start learning to see your progress here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {completedContentWeeks.map((week) => {
                const content = contentByWeek[week][0]

                return (
                  <AccordionItem
                    key={week}
                    value={`week-${week}`}
                    className="border border-green-500 dark:border-green-700 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 bg-green-50 dark:bg-green-900/30 hover:no-underline">
                      <div className="flex flex-1 justify-between items-center">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">
                            Week {week}: {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{content.description}</p>
                        </div>
                        <Badge className="bg-green-500 dark:bg-green-700 hover:bg-green-600 dark:hover:bg-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" /> Completed
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        {content.resources.map((resource, index) => {
                          const resourceId = `${week}-${index}`
                          const isResourceCompleted = resourceCompletions[resourceId]

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center">
                                {resource.type === "video" && (
                                  <Video className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                                )}
                                {resource.type === "notes" && (
                                  <FileText className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" />
                                )}
                                {resource.type === "link" && (
                                  <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                                )}
                                <div>
                                  <h4 className="font-medium dark:text-white">{resource.title}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {resource.type === "video" && "25 min"}
                                    {resource.type === "notes" && "Reading material"}
                                    {resource.type === "link" && "External resource"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link href={resource.url} target="_blank">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                  >
                                    View
                                  </Button>
                                </Link>
                                <MarkResourceButton
                                  weekNumber={week}
                                  resourceIndex={index}
                                  studentId={session.user.id}
                                  isCompleted={isResourceCompleted}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingContentWeeks.length === 0 ? (
            <Card className="border-blue-200 dark:border-blue-800 shadow-sm">
              <CardContent className="pt-6 dark:bg-gray-900">
                <p className="dark:text-white">You've completed all available content. Great job!</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {pendingContentWeeks.map((week) => {
                const content = contentByWeek[week][0]

                return (
                  <AccordionItem
                    key={week}
                    value={`week-${week}`}
                    className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 bg-blue-50 dark:bg-blue-900/30 hover:no-underline">
                      <div className="flex flex-1 justify-between items-center">
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-400">
                            Week {week}: {content.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{content.description}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                        >
                          <Clock className="mr-1 h-3 w-3" /> Pending
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 bg-white dark:bg-gray-900">
                      <div className="space-y-4">
                        {content.resources.map((resource, index) => {
                          const resourceId = `${week}-${index}`
                          const isResourceCompleted = resourceCompletions[resourceId]

                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center">
                                {resource.type === "video" && (
                                  <Video className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" />
                                )}
                                {resource.type === "notes" && (
                                  <FileText className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" />
                                )}
                                {resource.type === "link" && (
                                  <BookOpen className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-3" />
                                )}
                                <div>
                                  <h4 className="font-medium dark:text-white">{resource.title}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {resource.type === "video" && "25 min"}
                                    {resource.type === "notes" && "Reading material"}
                                    {resource.type === "link" && "External resource"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link href={resource.url} target="_blank">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                                  >
                                    View
                                  </Button>
                                </Link>
                                <MarkResourceButton
                                  weekNumber={week}
                                  resourceIndex={index}
                                  studentId={session.user.id}
                                  isCompleted={isResourceCompleted}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
