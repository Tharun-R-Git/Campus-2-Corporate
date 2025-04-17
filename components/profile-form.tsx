"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Base profile schema
const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
})

// Student profile schema
const studentProfileSchema = baseProfileSchema.extend({
  role: z.literal("student"),
  rollNumber: z.string().regex(/^22[A-Z]{3}\d{4}$/, "Invalid Roll Number format"),
  branch: z.string().min(1, "Branch is required"),
  school: z.string().min(1, "School is required"),
  cgpa: z.string().min(1, "CGPA is required"),
  category: z.enum(["Dream Package", "Super Dream Package", "Higher Studies"]).optional(),
})

// Alumni profile schema
const alumniProfileSchema = baseProfileSchema.extend({
  role: z.literal("alumni"),
  company: z.string().min(1, "Company is required"),
  position: z.string().min(1, "Position is required"),
  graduationYear: z.coerce.number().min(1900).max(new Date().getFullYear()),
})

// Define the serialized user type
type SerializedUser = {
  name: string
  email: string
  role: "student" | "alumni"
} & (
  | {
      role: "student"
      rollNumber: string
      branch: string
      school: string
      cgpa: string
      category?: "Dream Package" | "Super Dream Package" | "Higher Studies"
    }
  | {
      role: "alumni"
      company: string
      position: string
      graduationYear?: number
    }
)

interface ProfileFormProps {
  user: SerializedUser
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof studentProfileSchema> | z.infer<typeof alumniProfileSchema>>({
    resolver: zodResolver(user.role === "student" ? studentProfileSchema : alumniProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === "student"
        ? {
            rollNumber: user.rollNumber,
            branch: user.branch,
            school: user.school,
            cgpa: user.cgpa,
            category: user.category,
          }
        : {
            company: user.company,
            position: user.position,
            graduationYear: user.graduationYear || new Date().getFullYear() - 1,
          }),
    },
  })

  async function onSubmit(values: z.infer<typeof studentProfileSchema> | z.infer<typeof alumniProfileSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })

      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {user.role === "student" ? (
          <>
            <FormField
              control={form.control}
              name="rollNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="22BCE1234" {...field} />
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
                    <FormLabel>Branch</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormLabel>School</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                  <FormLabel>CGPA</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="10" placeholder="8.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <>
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Google, Microsoft, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer, Data Scientist, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graduationYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i - 1).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </form>
    </Form>
  )
}
