"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import StudentRegistrationForm from "@/components/student-registration-form"
import AlumniRegistrationForm from "@/components/alumni-registration-form"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"student" | "alumni" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!userType) return

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast("Registration started!", {
        description: "Please fill in your details to complete registration",
        duration: 3000,
      })
      
      router.push(`/register/${userType}`)
    } catch (error) {
      toast("An error occurred", {
        description: "Please try again later",
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <GraduationCap className="h-6 w-6" />
          <span className="text-lg font-bold">Campus2Corporate</span>
        </Link>
      </div>
      <main className="flex-1">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <div className="mx-auto w-full max-w-md space-y-6">
            {!userType ? (
              <Card className="border-border bg-card">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl font-bold text-center text-foreground">Create an account</CardTitle>
                  <CardDescription className="text-center text-muted-foreground">Choose your role to continue registration</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    className="gap-4" 
                    onValueChange={(value) => setUserType(value as "student" | "alumni" | null)}
                  >
                    <div className="flex items-center space-x-2 rounded-md border border-border p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground">Student</div>
                        <div className="text-sm text-muted-foreground">Current VIT student (2022 batch)</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-md border border-border p-4 cursor-pointer hover:bg-accent">
                      <RadioGroupItem value="alumni" id="alumni" />
                      <Label htmlFor="alumni" className="flex-1 cursor-pointer">
                        <div className="font-medium text-foreground">Alumni</div>
                        <div className="text-sm text-muted-foreground">VIT graduate (2021 or earlier)</div>
                      </Label>
                    </div>
                  </RadioGroup>
                  <div className="mt-6">
                    <Button 
                      className="w-full" 
                      onClick={handleContinue}
                      disabled={!userType || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : userType === "student" ? (
              <StudentRegistrationForm />
            ) : (
              <AlumniRegistrationForm />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
