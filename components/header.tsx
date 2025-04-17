"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">Placement Support System</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/content"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/dashboard/content" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Content
            </Link>
            <Link
              href="/dashboard/tasks"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/dashboard/tasks" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/alumni"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/dashboard/alumni" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              Alumni
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-gray-700 dark:text-gray-300 hover:bg-transparent dark:hover:bg-transparent"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
} 