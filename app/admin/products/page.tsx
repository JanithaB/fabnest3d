"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { Search, Plus, Edit2, Trash2, Loader2, X, Star } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

type ImageEntry = { fileId: string; url: string }

type Product = {
  id: string
  name: string
  description: string
  image: string
  basePrice: number
  category: string
  tags: string[]
  images?: Array<{
    fileId?: string
    file?: { url: string }
    url?: string
    isPrimary?: boolean
    order?: number
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

// File upload handler - adds one or more images
const createProductFileUploadHandler = (
  handleFileUpload: (file: File) => Promise<{ fileId: string; url: string } | null>,
  setFormData: (data: any) => void
) => {
  return async (files: File | FileList) => {
    const list = Array.isArray(files) ? files : files instanceof FileList ? Array.from(files) : [files]
    for (const file of list) {
      const result = await handleFileUpload(file)
      if (result) {
        setFormData((prev: any) => ({
          ...prev,
          imageEntries: [...(prev.imageEntries || []), { fileId: result!.fileId, url: result!.url }],
          primaryImageIndex: prev.imageEntries?.length === 0 ? 0 : (prev.primaryImageIndex ?? 0),
        }))
      }
    }
  }
}

// Multi-image upload for products with primary selection
const ProductMultiImageUpload = ({
  imageEntries,
  primaryImageIndex,
  onAdd,
  onRemove,
  onSetPrimary,
  disabled,
  uploading,
  isEdit,
}: {
  imageEntries: ImageEntry[]
  primaryImageIndex: number
  onAdd: (files: File | FileList) => Promise<void>
  onRemove: (index: number) => void
  onSetPrimary: (index: number) => void
  disabled?: boolean
  uploading?: boolean
  isEdit?: boolean
}) => (
  <div>
    <label className="text-sm font-medium mb-2 block">
      Images {isEdit ? '(optional)' : '*'} — first or selected is primary
    </label>
    <Input
      type="file"
      accept="image/*"
      multiple
      onChange={async (e) => {
        const files = e.target.files
        if (files?.length) {
          await onAdd(files)
          e.target.value = ""
        }
      }}
      disabled={disabled || uploading}
    />
    {uploading ? (
      <p className="text-sm text-muted-foreground mt-1">Uploading &amp; optimizing to WebP...</p>
    ) : (
      <p className="text-xs text-muted-foreground mt-1">
        JPEG/PNG/WebP accepted. Images are compressed and saved as WebP automatically.
      </p>
    )}
    {imageEntries.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {imageEntries.map((entry, index) => (
          <div key={entry.fileId} className="relative group">
            <div className={`w-20 h-20 rounded-lg overflow-hidden border-2 bg-muted ${primaryImageIndex === index ? 'border-primary' : 'border-transparent'}`}>
              <Image src={entry.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
            </div>
            <div className="absolute top-0 left-0 right-0 flex justify-between p-0.5 gap-0.5">
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full opacity-90 touch-manipulation flex items-center justify-center"
                onClick={() => onSetPrimary(index)}
                disabled={disabled}
                title="Set as primary"
                aria-label="Set as primary"
              >
                <Star className={`h-3 w-3 ${primaryImageIndex === index ? 'fill-primary' : ''}`} />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-full opacity-90 touch-manipulation flex items-center justify-center"
                onClick={() => onRemove(index)}
                disabled={disabled}
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)

// Product form fields component
const ProductFormFields = ({
  formData,
  setFormData,
  onFileSelect,
  onRemoveImage,
  onSetPrimaryImage,
  uploading,
  isEdit = false
}: {
  formData: any
  setFormData: (data: any) => void
  onFileSelect: (files: File | FileList) => Promise<void>
  onRemoveImage: (index: number) => void
  onSetPrimaryImage: (index: number) => void
  uploading?: boolean
  isEdit?: boolean
}) => (
  <>
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
      <ProductMultiImageUpload
        imageEntries={formData.imageEntries || []}
        primaryImageIndex={formData.primaryImageIndex ?? 0}
        onAdd={onFileSelect}
        onRemove={onRemoveImage}
        onSetPrimary={onSetPrimaryImage}
        uploading={uploading}
        disabled={uploading}
        isEdit={isEdit}
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
  </>
)

export default function AdminProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    imageEntries: ImageEntry[]
    primaryImageIndex: number
    basePrice: string
    category: string
    tags: string
  }>({
    name: "",
    description: "",
    imageEntries: [],
    primaryImageIndex: 0,
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
      imageEntries: [],
      primaryImageIndex: 0,
      basePrice: "",
      category: "",
      tags: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const next = { ...prev, imageEntries: prev.imageEntries.filter((_, i) => i !== index) }
      if (prev.primaryImageIndex >= next.imageEntries.length && next.imageEntries.length > 0) {
        next.primaryImageIndex = next.imageEntries.length - 1
      } else if (prev.primaryImageIndex > index) {
        next.primaryImageIndex = prev.primaryImageIndex - 1
      } else {
        next.primaryImageIndex = prev.primaryImageIndex
      }
      return next
    })
  }

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({ ...prev, primaryImageIndex: index }))
  }

  const handleFileUpload = async (file: File): Promise<{ fileId: string; url: string } | null> => {
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
      if (response.ok && data.file) {
        return { fileId: data.file.id, url: data.file.url || '' }
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
    const imageFileIds = (formData.imageEntries || []).map((e) => e.fileId)
    if (!formData.name || !formData.description || !formData.basePrice || imageFileIds.length === 0) {
      alert("Please fill in all required fields and upload at least one image")
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
          imageFileIds,
          primaryImageIndex: formData.primaryImageIndex ?? 0,
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
    const imgs = product.images || []
    const imageEntries: ImageEntry[] = imgs
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((img) => ({
        fileId: (img as any).fileId || '',
        url: (img as any).url || (img as any).file?.url || '',
      }))
      .filter((e) => e.fileId && e.url)
    const primaryIdx = imgs.findIndex((img) => (img as any).isPrimary)
    setFormData({
      name: product.name,
      description: product.description,
      imageEntries,
      primaryImageIndex: primaryIdx >= 0 ? primaryIdx : 0,
      basePrice: product.basePrice.toString(),
      category: product.category,
      tags: (product.tags || []).join(", "),
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
      updateData.imageFileIds = (formData.imageEntries || []).map((e) => e.fileId)
      updateData.primaryImageIndex = formData.primaryImageIndex ?? 0

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
            <ProductFormFields
              formData={formData}
              setFormData={setFormData}
              onFileSelect={createProductFileUploadHandler(handleFileUpload, setFormData)}
              onRemoveImage={handleRemoveImage}
              onSetPrimaryImage={handleSetPrimaryImage}
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
            <ProductFormFields
              formData={formData}
              setFormData={setFormData}
              onFileSelect={createProductFileUploadHandler(handleFileUpload, setFormData)}
              onRemoveImage={handleRemoveImage}
              onSetPrimaryImage={handleSetPrimaryImage}
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
                      src={product.images?.[0]?.url || product.image || "/gallery/placeholder.svg"} 
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
