"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Loader2 } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, _hasHydrated } = useAuth()

  useEffect(() => {
    // Wait for Zustand to hydrate from localStorage before checking auth
    if (!_hasHydrated) return

    if (!isAuthenticated) {
      router.push("/auth/login")
    } else if (user?.role !== "admin") {
      router.push("/account")
    }
  }, [_hasHydrated, isAuthenticated, user, router])

  // Show loading while Zustand hydrates from localStorage
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b flex items-center justify-end px-6 bg-background">
          <ThemeToggle />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
