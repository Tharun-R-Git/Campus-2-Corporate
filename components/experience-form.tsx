"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

const currentYear = new Date().getFullYear()

const formSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  package: z.string().optional(),
  yearOfPlacement: z
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be after 2000")
    .max(currentYear, `Year cannot be after ${currentYear}`),
  experience: z.string().min(10, "Experience must be at least 10 characters"),
  interviewProcess: z.string().min(10, "Interview process must be at least 10 characters"),
  tips: z.string().min(10, "Tips must be at least 10 characters"),
})

export default function ExperienceForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      role: "",
      package: "",
      yearOfPlacement: currentYear,
      experience: "",
      interviewProcess: "",
      tips: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to share experience")
      }

      toast({
        title: "Experience shared successfully",
        description: "Thank you for sharing your placement journey!",
      })

      form.reset()
      router.refresh()
    } catch (error) {
      console.error("Experience sharing error:", error)
      toast({
        title: "Sharing failed",
        description: error instanceof Error ? error.message : "An error occurred while sharing your experience",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Google, Microsoft" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Role</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Engineer, Data Scientist" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="package"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Package (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 12 LPA, $100,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearOfPlacement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year of Placement</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="2000"
                    max={currentYear}
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Experience</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your overall experience with the company and the placement process..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interviewProcess"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interview Process</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the interview rounds, types of questions asked, and the overall selection process..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tips"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tips for Students</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share advice, preparation tips, and resources that helped you succeed..."
                  className="min-h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sharing..." : "Share Experience"}
        </Button>
      </form>
    </Form>
  )
}
