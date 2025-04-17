"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PieChart,
  Settings,
  User,
  Users,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const studentLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Weekly Content",
      href: "/dashboard/content",
      icon: BookOpen,
    },
    {
      name: "Weekly Tasks",
      href: "/dashboard/tasks",
      icon: Settings,
    },
    {
      name: "Progress",
      href: "/dashboard/progress",
      icon: PieChart,
    },
    {
      name: "Alumni Experiences",
      href: "/dashboard/experiences",
      icon: Users,
    },
  ]

  const alumniLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Share Experience",
      href: "/dashboard/share-experience",
      icon: Users,
    },
  ]

  const links = user.role === "student" ? studentLinks : alumniLinks

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
        <GraduationCap className="h-6 w-6" />
        <span className="text-lg font-bold">Campus2Corporate</span>
      </Link>
      <nav className="hidden flex-1 md:flex">
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(link.href) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
              onClick={() => setOpen(false)}
            >
              <GraduationCap className="h-6 w-6" />
              <span>Campus2Corporate</span>
            </Link>
            <div className="grid gap-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive(link.href) ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex flex-1 items-center justify-end gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              {user.name}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
