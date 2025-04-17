"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function RegistrationForm({ type }: { type: "student" | "alumni" }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: type,
      ...(type === "student" && {
        rollNumber: formData.get("rollNumber") as string,
        branch: formData.get("branch") as string,
        school: formData.get("school") as string,
        cgpa: formData.get("cgpa") as string,
      }),
      ...(type === "alumni" && {
        company: formData.get("company") as string,
        position: formData.get("position") as string,
        graduationYear: parseInt(formData.get("graduationYear") as string),
      }),
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Registration failed")
      }

      toast("Registration successful!", {
        description: "Redirecting to login page...",
        duration: 2000,
      })

      router.push("/login")
    } catch (error) {
      toast("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-lg">
      <CardHeader className="space-y-1 bg-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold text-center text-blue-800">
          {type === "student" ? "Student Registration" : "Alumni Registration"}
        </CardTitle>
        <CardDescription className="text-center">
          {type === "student"
            ? "Create your student account to get started"
            : "Create your alumni account to share your experience"}
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-white rounded-b-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          {type === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  name="rollNumber"
                  type="text"
                  placeholder="Enter your roll number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  name="branch"
                  type="text"
                  placeholder="Enter your branch"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  name="school"
                  type="text"
                  placeholder="Enter your school"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cgpa">CGPA</Label>
                <Input
                  id="cgpa"
                  name="cgpa"
                  type="text"
                  placeholder="Enter your CGPA"
                  required
                />
              </div>
            </>
          )}

          {type === "alumni" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Enter your company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="Enter your position"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input
                  id="graduationYear"
                  name="graduationYear"
                  type="number"
                  placeholder="Enter your graduation year"
                  required
                />
              </div>
            </>
          )}

          <Button 
            className="w-full" 
            type="submit"
            disabled={isLoading}
          >
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
      </CardContent>
    </Card>
  )
} 