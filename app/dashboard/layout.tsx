import type React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarProvider>
        <DashboardSidebar user={session.user} />
        <SidebarInset className="flex-1 p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
