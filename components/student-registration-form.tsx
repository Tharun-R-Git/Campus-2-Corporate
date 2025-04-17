"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => email.endsWith("@vitstudent.ac.in"), {
      message: "Email must be a valid VIT student email",
    })
    .refine((email) => email.includes("2022"), {
      message: "Only 2022 batch students are allowed",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  rollNumber: z.string().regex(/^22[A-Z]{3}\d{4}$/, "Invalid Roll Number format"),
  branch: z.string().min(1, "Branch is required"),
  school: z.string().min(1, "School is required"),
  cgpa: z.string().min(1, "CGPA is required"),
  role: z.literal("student"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function StudentRegistrationForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      rollNumber: "",
      branch: "",
      school: "",
      cgpa: "",
      role: "student",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const { confirmPassword, ...data } = values

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Registration failed")
      }

      toast("Registration successful!", {
        description: "You can now log in with your credentials",
        duration: 3000,
      })

      router.push("/login")
    } catch (error) {
      console.error("Registration error:", error)
      toast("Registration failed", {
        description: error instanceof Error ? error.message : "An error occurred during registration",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 bg-white rounded-t-lg">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="mr-2 p-0 h-8 w-8" onClick={() => router.push("/register")}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold text-blue-800">Student Registration</CardTitle>
            <CardDescription>Create an account to access placement preparation resources</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-white rounded-b-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="border-blue-200 focus-visible:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe2022@vitstudent.ac.in"
                      className="border-blue-200 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="22BCE1234" className="border-blue-200 focus-visible:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Branch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CSE">CSE</SelectItem>
                        <SelectItem value="ECE">ECE</SelectItem>
                        <SelectItem value="EEE">EEE</SelectItem>
                        <SelectItem value="MECH">MECH</SelectItem>
                        <SelectItem value="CIVIL">CIVIL</SelectItem>
                        <SelectItem value="IT">IT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="school"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">School</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                          <SelectValue placeholder="Select school" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCOPE">SCOPE</SelectItem>
                        <SelectItem value="SENSE">SENSE</SelectItem>
                        <SelectItem value="SITE">SITE</SelectItem>
                        <SelectItem value="SMEC">SMEC</SelectItem>
                        <SelectItem value="SAS">SAS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="cgpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">CGPA</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      placeholder="8.5"
                      className="border-blue-200 focus-visible:ring-blue-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="border-blue-200 focus-visible:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="border-blue-200 focus-visible:ring-blue-500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
