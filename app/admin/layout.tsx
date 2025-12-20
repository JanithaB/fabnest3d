"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.role !== "admin") {
      router.push("/account")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </>
  )
}
