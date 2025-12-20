"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Image as ImageIcon, Edit2 } from "lucide-react"
import { galleryItems } from "@/lib/gallery-data"
import type { GalleryItem } from "@/lib/types"

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(galleryItems)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    customerName: "",
    tags: "",
  })

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image: "",
      customerName: "",
      tags: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!formData.title || !formData.description || !formData.image) {
      alert("Please fill in all required fields")
      return
    }

    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      image: formData.image,
      customerName: formData.customerName || undefined,
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      createdAt: new Date(),
    }

    setItems([newItem, ...items])
    resetForm()
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description,
      image: item.image,
      customerName: item.customerName || "",
      tags: item.tags.join(", "),
    })
  }

  const handleUpdate = () => {
    if (!formData.title || !formData.description || !formData.image) {
      alert("Please fill in all required fields")
      return
    }

    setItems(
      items.map((item) =>
        item.id === editingId
          ? {
              ...item,
              title: formData.title,
              description: formData.description,
              image: formData.image,
              customerName: formData.customerName || undefined,
              tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
            }
          : item
      )
    )
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this gallery item?")) {
      setItems(items.filter((item) => item.id !== id))
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
            <div>
              <label className="text-sm font-medium mb-2 block">Image URL *</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/image.jpg"
              />
            </div>
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
            <div className="flex gap-2">
              <Button onClick={handleAdd}>Add Item</Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-0">
              <div className="relative w-full aspect-square overflow-hidden bg-muted">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="object-cover w-full h-full"
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
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <X className="h-4 w-4" />
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
                  Added: {item.createdAt.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Gallery Item</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div>
              <label className="text-sm font-medium mb-2 block">Image URL *</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/image.jpg"
              />
            </div>
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
            <div className="flex gap-2">
              <Button onClick={handleUpdate}>Update Item</Button>
              <Button variant="outline" onClick={resetForm}>
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

