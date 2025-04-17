"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const formSchema = z.object({
  category: z.enum(["Dream Package", "Super Dream Package", "Higher Studies"], {
    required_error: "Please select a category",
  }),
})

interface CategorySelectionProps {
  currentCategory?: string
}

export default function CategorySelection({ currentCategory }: CategorySelectionProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [initialCategory, setInitialCategory] = useState<string | undefined>(currentCategory)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: (currentCategory as any) || undefined,
    },
  })

  // Update form value when currentCategory changes
  useEffect(() => {
    if (currentCategory) {
      form.setValue("category", currentCategory as any)
      setInitialCategory(currentCategory)
    }
  }, [currentCategory, form])

  const selectedCategory = form.watch("category")
  const hasChanged = selectedCategory !== initialCategory

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // If changing category and already had a category, show confirmation dialog
    if (initialCategory && values.category !== initialCategory) {
      setShowConfirmDialog(true)
      return
    }

    await submitCategory(values)
  }

  async function submitCategory(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/student/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          resetProgress: initialCategory && values.category !== initialCategory,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update category")
      }

      toast({
        title: initialCategory ? "Category updated" : "Category selected",
        description: initialCategory
          ? "Your preparation category has been updated successfully"
          : "Your preparation category has been set successfully",
      })

      setInitialCategory(values.category)
      router.refresh()
    } catch (error) {
      console.error("Category update error:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "An error occurred while updating category",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-base font-medium dark:text-white">
                  Select your preparation category
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="Dream Package"
                          className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer dark:text-white">Dream Package</FormLabel>
                      {field.value === "Dream Package" && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 ml-auto" />
                      )}
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="Super Dream Package"
                          className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer dark:text-white">Super Dream Package</FormLabel>
                      {field.value === "Super Dream Package" && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 ml-auto" />
                      )}
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="Higher Studies"
                          className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer dark:text-white">Higher Studies</FormLabel>
                      {field.value === "Higher Studies" && (
                        <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 ml-auto" />
                      )}
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isLoading || !selectedCategory || (!hasChanged && initialCategory)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : initialCategory ? (
              "Update Category"
            ) : (
              "Save Category"
            )}
          </Button>
        </form>
      </Form>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-blue-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Change Category?</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Changing your category will reset your progress. All your submissions and completed content will be lost.
              Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="destructive"
              onClick={() => submitCategory({ category: form.getValues().category })}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Yes, change and reset progress
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
