"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, File, X, ArrowRight, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

const MATERIALS = [
  { value: "pla", label: "PLA (Standard)" },
  { value: "abs", label: "ABS (Durable)" },
  { value: "petg", label: "PETG (Strong)" },
  { value: "tpu", label: "TPU (Flexible)" },
  { value: "resin", label: "Resin (High Detail)" },
]

const QUALITY_OPTIONS = [
  { value: "draft", label: "Draft (0.3mm)" },
  { value: "standard", label: "Standard (0.2mm)" },
  { value: "high", label: "High (0.1mm)" },
  { value: "ultra", label: "Ultra (0.05mm)" },
]

export function FileUpload() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [material, setMaterial] = useState("pla")
  const [quality, setQuality] = useState("standard")
  const [notes, setNotes] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile)
    } else {
      alert("Please upload a valid file (STL, OBJ, 3MF, RAR, or ZIP)")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile)
    } else {
      alert("Please upload a valid file (STL, OBJ, 3MF, RAR, or ZIP)")
    }
  }

  const isValidFileType = (file: File) => {
    const validExtensions = [".stl", ".obj", ".3mf", ".rar", ".zip"]
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  }

  const removeFile = () => {
    setFile(null)
  }

  const handleRequestQuote = async () => {
    if (!file) {
      setUploadError("Please upload a file first")
      return
    }

    if (!isAuthenticated || !user) {
      setUploadError("Please log in to upload files")
      router.push("/auth/login")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Step 1: Upload the file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'model')

      // Get token from auth store
      const { token } = useAuth.getState()

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
        body: formData,
      })

      const uploadData = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Upload failed')
      }

      // Step 2: Create custom order file record
      const customOrderResponse = await fetch('/api/upload/custom-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          fileId: uploadData.file.id,
          material: material,
          quality: quality,
          notes: notes || null,
        }),
      })

      const customOrderData = await customOrderResponse.json()

      if (!customOrderResponse.ok) {
        throw new Error(customOrderData.error || 'Failed to create order')
      }

      // Step 3: Create quote request
      const quoteResponse = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          customFileId: customOrderData.customFile.id,
        }),
      })

      const quoteData = await quoteResponse.json()

      if (!quoteResponse.ok) {
        throw new Error(quoteData.error || 'Failed to create quote request')
      }

      // Step 4: Show success and redirect
      alert('Quote request submitted successfully! An admin will review your file and send you a price quote via email.')
      router.push('/account/orders')
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Failed to upload file. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload 3D Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".stl,.obj,.3mf,.rar,.zip"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drop your file here, or browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports: STL, OBJ, 3MF, RAR, ZIP (max 100MB)</p>
                </div>
              </div>
            </label>
          </div>

          {/* Display uploaded file */}
          {file && (
            <div className="flex items-center justify-between p-4 border-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                  <File className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile}>
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Print Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Material Selection */}
          <div className="space-y-2">
            <Label htmlFor="upload-material">Material</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger id="upload-material">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS.map((mat) => (
                  <SelectItem key={mat.value} value={mat.value}>
                    {mat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quality Selection */}
          <div className="space-y-2">
            <Label htmlFor="quality">Print Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger id="quality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((q) => (
                  <SelectItem key={q.value} value={q.value}>
                    {q.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Higher quality increases print time and cost</p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes for your print..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Request Quote Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Request Price Quote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {file ? (
            <>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  After uploading your file, our team will review it and send you a detailed price quote via email. 
                  You'll receive a Proforma Invoice (PI) with the exact pricing.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material:</span>
                    <span className="font-medium">{MATERIALS.find(m => m.value === material)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality:</span>
                    <span className="font-medium">{QUALITY_OPTIONS.find(q => q.value === quality)?.label}</span>
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              <Button 
                onClick={handleRequestQuote} 
                size="lg" 
                className="w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Request Price Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">Upload a file to request a price quote</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
