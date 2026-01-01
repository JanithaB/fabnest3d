"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { FileUpload } from "@/components/file-upload"
import { useAuth } from "@/lib/auth"

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect admins to admin dashboard
    if (user?.role === "admin") {
      router.push("/admin")
    }
  }, [user, router])

  if (user?.role === "admin") {
    return null
  }

  return (
    <main className="flex-1 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">Upload Your Design</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload your 3D model file and request a price quote. Our team will review your file and send you a detailed Proforma Invoice via email. We support STL, OBJ, 3MF, RAR, and ZIP file formats.
          </p>
        </div>

        <FileUpload />
      </div>
    </main>
  )
}
