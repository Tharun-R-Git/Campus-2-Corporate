"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password", {
          description: "Please check your credentials and try again",
        })
      } else {
        toast.success("Logged in successfully!", {
          description: "Redirecting to dashboard...",
        })
        router.push(callbackUrl)
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please try again later",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 md:px-0">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              name="email"
              placeholder="Enter your email"
              type="email"
              required
              className="w-full bg-background border-border"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              name="password"
              placeholder="Enter your password"
              type="password"
              required
              className="w-full bg-background border-border"
              disabled={isLoading}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
          <div className="text-center text-sm">
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
