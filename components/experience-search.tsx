"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function ExperienceSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("company") || "")

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams)

      if (search) {
        params.set("company", search)
      } else {
        params.delete("company")
      }

      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, router, pathname, searchParams])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Input
        type="text"
        placeholder="Search by company name, role, or keyword..."
        className="pl-10 border-blue-200 dark:border-blue-800 dark:bg-gray-800 dark:text-white focus-visible:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  )
}
