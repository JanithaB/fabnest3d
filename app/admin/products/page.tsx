"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { products as initialProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"
import { Search, Plus, Edit2, Trash2, X } from "lucide-react"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    basePrice: "",
    category: "",
    tags: "",
  })

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      basePrice: "",
      category: "",
      tags: "",
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!formData.name || !formData.description || !formData.image || !formData.basePrice) {
      alert("Please fill in all required fields")
      return
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      image: formData.image,
      basePrice: parseFloat(formData.basePrice),
      category: formData.category || "Uncategorized",
      tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    }

    setProducts([newProduct, ...products])
    resetForm()
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      image: product.image,
      basePrice: product.basePrice.toString(),
      category: product.category,
      tags: product.tags.join(", "),
    })
  }

  const handleUpdate = () => {
    if (!formData.name || !formData.description || !formData.image || !formData.basePrice) {
      alert("Please fill in all required fields")
      return
    }

    setProducts(
      products.map((product) =>
        product.id === editingId
          ? {
              ...product,
              name: formData.name,
              description: formData.description,
              image: formData.image,
              basePrice: parseFloat(formData.basePrice),
              category: formData.category || "Uncategorized",
              tags: formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
            }
          : product
      )
    )
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((product) => product.id !== id))
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
              <div>
                <label className="text-sm font-medium mb-2 block">Image URL *</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/image.jpg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Base Price ($) *</label>
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
              <Button onClick={handleAdd}>Add Product</Button>
              <Button variant="outline" onClick={resetForm}>
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
              <div>
                <label className="text-sm font-medium mb-2 block">Image URL *</label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/image.jpg"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Base Price ($) *</label>
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
              <Button onClick={handleUpdate}>Update Product</Button>
              <Button variant="outline" onClick={resetForm}>
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
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Price: <span className="font-medium text-foreground">${product.basePrice.toFixed(2)}</span>
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
                  <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
