"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { Search, Plus, Edit2, Trash2, Loader2 } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

type Product = {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
  tags: string[]
  images?: Array<{
    file: {
      url: string
    }
  }>
}

// Helper function to prepare product form data for API
const prepareProductFormData = (formData: any) => ({
  name: formData.name.trim(),
  description: formData.description.trim(),
  basePrice: parseFloat(formData.basePrice),
  category: formData.category.trim() || "Uncategorized",
  tags: formData.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean),
})

// File upload handler wrapper for products
const createProductFileUploadHandler = (handleFileUpload: (file: File) => Promise<string | null>, setFormData: (data: any) => void, formData: any) => {
  return async (file: File) => {
    const fileId = await handleFileUpload(file)
    if (fileId) {
      setFormData({ ...formData, imageFileId: fileId })
    }
  }
}

// File upload input component for products
const ProductFileUploadInput = ({ 
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

export default function AdminProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageFileId: "",
    basePrice: "",
    category: "",
    tags: "",
  })
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (token) {
      fetchProducts()
    }
  }, [token])

  const fetchProducts = async () => {
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) return

      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      imageFileId: "",
      basePrice: "",
      category: "",
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
      formData.append('destination', 'products')

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
    if (!formData.name || !formData.description || !formData.imageFileId || !formData.basePrice) {
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

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          ...prepareProductFormData(formData),
          imageFileId: formData.imageFileId,
        })
      })

      const data = await response.json()
      if (response.ok) {
        await fetchProducts()
        resetForm()
        alert('Product added successfully!')
      } else {
        alert(data.error || 'Failed to add product')
      }
    } catch (error) {
      console.error('Add product error:', error)
      alert('Failed to add product')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      imageFileId: product.images?.[0]?.file?.url ? "" : "", // Will be set if new image uploaded
      basePrice: product.basePrice.toString(),
      category: product.category,
      tags: product.tags.join(", "),
    })
  }

  const handleUpdate = async () => {
    if (!formData.name || !formData.description || !formData.basePrice || !editingId) {
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

      const updateData: any = prepareProductFormData(formData)

      // Only include imageFileId if a new image was uploaded
      if (formData.imageFileId) {
        updateData.imageFileId = formData.imageFileId
      }

      const response = await fetch(`/api/products/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      if (response.ok) {
        await fetchProducts()
        resetForm()
        alert('Product updated successfully!')
      } else {
        alert(data.error || 'Failed to update product')
      }
    } catch (error) {
      console.error('Update product error:', error)
      alert('Failed to update product')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    setDeleting(id)
    try {
      const currentToken = useAuth.getState().token
      if (!currentToken) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      if (response.ok) {
        await fetchProducts()
        alert('Product deleted successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete product error:', error)
      alert('Failed to delete product')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">Manage your 3D printing catalog</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {isAdding && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Geometric Vase"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ProductFileUploadInput
                onFileSelect={createProductFileUploadHandler(handleFileUpload, setFormData, formData)}
                disabled={uploading}
                uploading={uploading}
                hasFile={false}
              />
              <div>
                <label className="text-sm font-medium mb-2 block">Base Price (LKR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="22.50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Home Decor"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Popular, Home, Decorative"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editingId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Geometric Vase"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ProductFileUploadInput
                onFileSelect={createProductFileUploadHandler(handleFileUpload, setFormData, formData)}
                disabled={uploading || updating}
                uploading={uploading}
                hasFile={true}
              />
              <div>
                <label className="text-sm font-medium mb-2 block">Base Price (LKR) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="22.50"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Home Decor"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Popular, Home, Decorative"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </Button>
              <Button variant="outline" onClick={resetForm} disabled={updating}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image 
                      src={product.images?.[0]?.file?.url || product.image || "/gallery/placeholder.svg"} 
                      alt={product.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Price: <span className="font-medium text-foreground">{formatCurrency(product.basePrice)}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Category: <span className="font-medium text-foreground">{product.category}</span>
                    </span>
                  </div>
                  {product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleEdit(product)}
                      disabled={deleting === product.id}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleDelete(product.id)} 
                      className="text-destructive"
                      disabled={deleting === product.id || deleting !== null}
                    >
                      {deleting === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
