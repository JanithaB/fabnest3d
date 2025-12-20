"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, File, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

const MATERIALS = [
  { value: "pla", label: "PLA (Standard)" },
  { value: "abs", label: "ABS (Durable)" },
  { value: "petg", label: "PETG (Strong)" },
  { value: "tpu", label: "TPU (Flexible)" },
  { value: "resin", label: "Resin (High Detail)" },
]

const QUALITY_OPTIONS = [
  { value: "draft", label: "Draft (0.3mm)", price: 0.8 },
  { value: "standard", label: "Standard (0.2mm)", price: 1.0 },
  { value: "high", label: "High (0.1mm)", price: 1.4 },
  { value: "ultra", label: "Ultra (0.05mm)", price: 2.0 },
]

export function FileUpload() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [material, setMaterial] = useState("pla")
  const [quality, setQuality] = useState("standard")
  const [notes, setNotes] = useState("")
  const [isDragging, setIsDragging] = useState(false)

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
      alert("Please upload a valid 3D file (STL, OBJ, or 3MF)")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile)
    } else {
      alert("Please upload a valid 3D file (STL, OBJ, or 3MF)")
    }
  }

  const isValidFileType = (file: File) => {
    const validExtensions = [".stl", ".obj", ".3mf"]
    return validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext))
  }

  const removeFile = () => {
    setFile(null)
  }

  // Calculate estimated price (mock calculation)
  const qualityMultiplier = QUALITY_OPTIONS.find((q) => q.value === quality)?.price || 1
  const estimatedPrice = file ? (25 * qualityMultiplier).toFixed(2) : "0.00"

  const handleProceedToCheckout = () => {
    if (!file) {
      alert("Please upload a file first")
      return
    }
    // In a real app, this would save the upload data to state/context
    router.push("/checkout")
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
              accept=".stl,.obj,.3mf"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="space-y-3">
                <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Drop your file here, or browse</p>
                  <p className="text-sm text-muted-foreground mt-1">Supports: STL, OBJ, 3MF (max 100MB)</p>
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

      {/* Price Estimate Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle>Price Estimate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {file ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Price:</span>
                  <span>$25.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quality Adjustment:</span>
                  <span>×{qualityMultiplier.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex justify-between text-2xl font-bold pt-2 border-t">
                <span>Estimated Total:</span>
                <span className="text-primary">${estimatedPrice}</span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Final price may vary based on actual model volume and complexity
              </p>

              <Button onClick={handleProceedToCheckout} size="lg" className="w-full">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-4">Upload a file to see price estimate</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
