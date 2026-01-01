"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to login...</p>
    </div>
  )
}

