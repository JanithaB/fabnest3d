"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Image as ImageIcon, Edit2, Loader2, Trash2 } from "lucide-react"
import { useAuth } from "@/lib/auth"
import Image from "next/image"

type GalleryItem = {
  id: string
  title: string
  description: string
  image: string
  images: Array<{
    id: string
    url: string
    order: number
  }>
  customerName?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Helper function to prepare form data for API
const prepareFormData = (formData: any) => ({
  title: formData.title.trim(),
  description: formData.description.trim(),
  customerName: formData.customerName.trim() || null,
  tags: formData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean),
})

// File upload handler wrapper
const createFileUploadHandler = (handleFileUpload: (file: File) => Promise<string | null>, setFormData: (data: any) => void, formData: any) => {
  return async (file: File) => {
    const fileId = await handleFileUpload(file)
    if (fileId) {
      setFormData({ ...formData, imageFileId: fileId })
    }
  }
}

// File upload input component
const FileUploadInput = ({ 
  onFileSelect, 
  disabled, 
  uploading, 
  hasFile 
}: { 
  onFileSelect: (file: File) => Promise<void>
  disabled?: boolean
  uploading?: boolean
  hasFile?: boolean
}) => (
  <div>
    <label className="text-sm font-medium mb-2 block">Image {hasFile ? '(optional - leave empty to keep current)' : '*'}</label>
    <Input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0]
        if (file) {
          await onFileSelect(file)
        }
      }}
      disabled={disabled || uploading}
    />
    {uploading && (
      <p className="text-sm text-muted-foreground mt-1">Uploading...</p>
    )}
    {hasFile && !uploading && (
      <p className="text-sm text-green-600 mt-1">✓ {hasFile ? 'New image' : 'Image'} uploaded</p>
    )}
  </div>
)

// Form fields component for gallery item
const GalleryFormFields = ({
  formData,
  setFormData,
  onFileSelect,
  uploading,
  isEdit = false
}: {
  formData: any
  setFormData: (data: any) => void
  onFileSelect: (file: File) => Promise<void>
  uploading?: boolean
  isEdit?: boolean
}) => (
  <>
    <div>
      <label className="text-sm font-medium mb-2 block">Title *</label>
      <Input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Custom Architectural Model"
      />
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block">Description *</label>
      <Textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Detailed description of the work..."
        rows={3}
      />
    </div>
    <FileUploadInput
      onFileSelect={onFileSelect}
      disabled={uploading}
      uploading={uploading}
      hasFile={isEdit}
    />
    <div>
      <label className="text-sm font-medium mb-2 block">Customer Name (optional)</label>
      <Input
        value={formData.customerName}
        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
        placeholder="Customer or Company Name"
      />
    </div>
    <div>
      <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
      <Input
        value={formData.tags}
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        placeholder="Architecture, Professional, Resin"
      />
    </div>
  </>
)

export default function AdminGalleryPage() {
  const { token } = useAuth()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFileId: "",
    customerName: "",
    tags: "",
  })
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (token) {
      fetchGalleryItems()
    }
  }, [token])

  const fetchGalleryItems = async () => {
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) return

      const response = await fetch('/api/gallery', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageFileId: "",
      customerName: "",
      tags: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleFileUpload = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return null
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileType', 'image')
      formData.append('destination', 'gallery')

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        },
        body: formData,
      })

      const data = await response.json()
      if (response.ok) {
        return data.file.id
      } else {
        alert(data.error || 'Failed to upload image')
        return null
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.title || !formData.description || !formData.imageFileId) {
      alert("Please fill in all required fields and upload an image")
      return
    }

    setUploading(true)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          ...prepareFormData(formData),
          imageFileId: formData.imageFileId,
        })
      })

      const data = await response.json()
      if (response.ok) {
        await fetchGalleryItems()
        resetForm()
        alert('Gallery item added successfully!')
      } else {
        alert(data.error || 'Failed to add gallery item')
      }
    } catch (error) {
      console.error('Add gallery item error:', error)
      alert('Failed to add gallery item')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description,
      imageFileId: (item.images as any)?.[0]?.fileId || "",
      customerName: item.customerName || "",
      tags: item.tags.join(", "),
    })
  }

  const handleUpdate = async () => {
    if (!formData.title || !formData.description || !editingId) {
      alert("Please fill in all required fields")
      return
    }

    setUpdating(true)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const updateData: any = prepareFormData(formData)

      // Only include imageFileId if a new image was uploaded
      if (formData.imageFileId) {
        updateData.imageFileId = formData.imageFileId
      }

      const response = await fetch(`/api/gallery/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (response.ok) {
        await fetchGalleryItems()
        resetForm()
        alert('Gallery item updated successfully!')
      } else {
        alert(data.error || 'Failed to update gallery item')
      }
    } catch (error) {
      console.error('Update gallery item error:', error)
      alert('Failed to update gallery item')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) {
      return
    }

    setDeleting(id)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        await fetchGalleryItems()
        alert('Gallery item deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete gallery item')
      }
    } catch (error) {
      console.error('Delete gallery item error:', error)
      alert('Failed to delete gallery item')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gallery Management</h1>
          <p className="text-muted-foreground">Manage customer work showcase items</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Gallery Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GalleryFormFields
              formData={formData}
              setFormData={setFormData}
              onFileSelect={createFileUploadHandler(handleFileUpload, setFormData, formData)}
              uploading={uploading}
              isEdit={false}
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Item"
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-0">
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  <Image
                    src={item.image || "/gallery/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                        disabled={deleting === item.id}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id || deleting !== null}
                      >
                        {deleting === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                {item.customerName && (
                  <p className="text-xs text-muted-foreground">Customer: {item.customerName}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                  <p className="text-xs text-muted-foreground">
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Gallery Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <GalleryFormFields
              formData={formData}
              setFormData={setFormData}
              onFileSelect={createFileUploadHandler(handleFileUpload, setFormData, formData)}
              uploading={uploading || updating}
              isEdit={true}
            />
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Item"
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={updating}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No gallery items yet. Add your first item to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

