"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { BookOpen, CheckSquare, GraduationCap, LayoutDashboard, PieChart, Settings, User, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useTheme } from "next-themes"

interface DashboardSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(true)
  const { theme, setTheme } = useTheme()

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
      name: "Category Selection",
      href: "/dashboard/category",
      icon: Settings,
    },
    {
      name: "Learning Content",
      href: "/dashboard/content",
      icon: BookOpen,
    },
    {
      name: "Weekly Tasks",
      href: "/dashboard/tasks",
      icon: CheckSquare,
    },
    {
      name: "Progress & Performance",
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

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 py-4">
        <div className="flex items-center px-4">
          <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-lg font-bold text-blue-600 dark:text-blue-400">Campus2Corporate</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(link.href)}
                className={cn(
                  "flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
                )}
              >
                <button onClick={() => router.push(link.href)} className="flex items-center gap-2 w-full">
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800"
        >
          Toggle Theme
        </button>
        <button
          onClick={handleSignOut}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-800"
        >
          Sign Out
        </button>
      </div>
    </Sidebar>
  )
}
