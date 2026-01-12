"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { 
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getAllCategories,
  getSubcategoriesByCategory,
  getAllCompanyBrands
} from "@/app/actions/products-management"
import { uploadProductImage, deleteProductImage } from "@/app/actions/image-upload"
import { Product, ProductFormData, Category, Subcategory, CompanyBrand } from "@/types/database"
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, X, Search } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [companyBrands, setCompanyBrands] = useState<CompanyBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    code: "",
    quantity: 0,
    product_cost: 0,
    price: 0,
    image: "",
    company_brand_id: "",
    category_id: "",
    subcategory_id: "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const loadProducts = async () => {
    setLoading(true)
    const result = await getAllProducts()
    if (result.success && result.data) {
      setProducts(result.data)
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const result = await getAllCategories()
    if (result.success && result.data) {
      setCategories(result.data)
    }
  }

  const loadCompanyBrands = async () => {
    const result = await getAllCompanyBrands()
    if (result.success && result.data) {
      setCompanyBrands(result.data)
    }
  }

  const loadSubcategories = async (categoryId: string) => {
    if (!categoryId) {
      setSubcategories([])
      return
    }
    const result = await getSubcategoriesByCategory(categoryId)
    if (result.success && result.data) {
      setSubcategories(result.data)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadCompanyBrands()
  }, [])

  useEffect(() => {
    if (formData.category_id) {
      loadSubcategories(formData.category_id)
    } else {
      setSubcategories([])
      setFormData({ ...formData, subcategory_id: "" })
    }
  }, [formData.category_id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData({ ...formData, image: "" })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let imageUrl = formData.image
    
    // Upload image if a new file is selected
    if (imageFile) {
      setUploadingImage(true)
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)
      uploadFormData.append('productCode', formData.code || "product")
      const uploadResult = await uploadProductImage(uploadFormData)
      setUploadingImage(false)
      
      if (!uploadResult.success) {
        alert(`Error uploading image: ${uploadResult.error}`)
        return
      }
      imageUrl = uploadResult.url || ""
    }

    const result = await addProduct({ ...formData, image: imageUrl })
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        name: "",
        description: "",
        code: "",
        quantity: 0,
        product_cost: 0,
        price: 0,
        image: "",
        company_brand_id: "",
        category_id: "",
        subcategory_id: "",
      })
      setImageFile(null)
      setImagePreview(null)
      setSubcategories([])
      await loadProducts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditClick = async (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      code: product.code,
      quantity: product.quantity,
      product_cost: product.product_cost,
      price: product.price,
      image: product.image || "",
      company_brand_id: product.company_brand_id || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
    })
    setImageFile(null)
    setImagePreview(product.image || null)
    if (product.category_id) {
      await loadSubcategories(product.category_id)
    }
    setEditDialogOpen(true)
  }

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    let imageUrl = formData.image
    
    // Upload new image if a file is selected
    if (imageFile) {
      setUploadingImage(true)
      // Delete old image if it exists
      if (editingProduct.image) {
        await deleteProductImage(editingProduct.image)
      }
      const uploadFormData = new FormData()
      uploadFormData.append('file', imageFile)
      uploadFormData.append('productCode', formData.code || editingProduct.code)
      const uploadResult = await uploadProductImage(uploadFormData)
      setUploadingImage(false)
      
      if (!uploadResult.success) {
        alert(`Error uploading image: ${uploadResult.error}`)
        return
      }
      imageUrl = uploadResult.url || ""
    }

    const result = await updateProduct(editingProduct.id, { ...formData, image: imageUrl })
    if (result.success) {
      setEditDialogOpen(false)
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        code: "",
        quantity: 0,
        product_cost: 0,
        price: 0,
        image: "",
        company_brand_id: "",
        category_id: "",
        subcategory_id: "",
      })
      setImageFile(null)
      setImagePreview(null)
      setSubcategories([])
      await loadProducts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const result = await deleteProduct(id)
    if (result.success) {
      await loadProducts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Filter products by search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (product.company_brand && product.company_brand.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Calculate total products cost (quantity * product_cost for all products)
  const totalProductsCost = filteredProducts.reduce((sum, product) => {
    return sum + (product.quantity * product.product_cost)
  }, 0)

  // Calculate total products value (quantity * price for all products)
  const totalProductsValue = filteredProducts.reduce((sum, product) => {
    return sum + (product.quantity * product.price)
  }, 0)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Total Products: <span className="font-semibold">{products.length}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Product</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_cost">Product Cost *</Label>
                    <Input
                      id="product_cost"
                      type="number"
                      step="0.01"
                      value={formData.product_cost}
                      onChange={(e) =>
                        setFormData({ ...formData, product_cost: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="image"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-slate-400">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </Label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_brand">Company Brand</Label>
                  <Select
                    id="company_brand"
                    value={formData.company_brand_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, company_brand_id: e.target.value })
                    }
                  >
                    <option value="">Select Company Brand</option>
                    {companyBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      id="category"
                      value={formData.category_id || ""}
                      onChange={(e) => {
                        setFormData({ 
                          ...formData, 
                          category_id: e.target.value,
                          subcategory_id: "" // Reset subcategory when category changes
                        })
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Sub Category</Label>
                    <Select
                      id="subcategory"
                      value={formData.subcategory_id || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, subcategory_id: e.target.value })
                      }
                      disabled={!formData.category_id}
                    >
                      <option value="">Select Sub Category</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto" disabled={uploadingImage}>
                    {uploadingImage ? "Uploading..." : "Save Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Code *</Label>
                <Input
                  id="edit-code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product_cost">Product Cost *</Label>
                <Input
                  id="edit-product_cost"
                  type="number"
                  step="0.01"
                  value={formData.product_cost}
                  onChange={(e) =>
                    setFormData({ ...formData, product_cost: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Product Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-slate-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="edit-image"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-slate-400">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </Label>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company_brand">Company Brand</Label>
              <Select
                id="edit-company_brand"
                value={formData.company_brand_id || ""}
                onChange={(e) =>
                  setFormData({ ...formData, company_brand_id: e.target.value })
                }
              >
                <option value="">Select Company Brand</option>
                {companyBrands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  id="edit-category"
                  value={formData.category_id || ""}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      category_id: e.target.value,
                      subcategory_id: "" // Reset subcategory when category changes
                    })
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory">Sub Category</Label>
                <Select
                  id="edit-subcategory"
                  value={formData.subcategory_id || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, subcategory_id: e.target.value })
                  }
                  disabled={!formData.category_id}
                >
                  <option value="">Select Sub Category</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingProduct(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={uploadingImage}>
                {uploadingImage ? "Uploading..." : "Update Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading products..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-foreground">
              {searchTerm ? "No products found matching your search." : "No products found. Add your first product!"}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
              <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Image</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Code</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Description</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Quantity</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Price</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Brand</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Sub Category</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr key={product.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}>
                      <td className="p-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium text-gray-900 text-sm">{product.name}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {product.code}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-700 text-sm max-w-xs truncate" title={product.description || ""}>
                        {product.description || "-"}
                      </td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{product.quantity.toFixed(2)}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{product.product_cost.toFixed(2)}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{product.price.toFixed(2)}</td>
                      <td className="p-3 text-gray-700 text-sm">
                        {product.company_brand?.name || "-"}
                      </td>
                      <td className="p-3 text-gray-700 text-sm">
                        {product.category?.name || "-"}
                      </td>
                      <td className="p-3 text-gray-700 text-sm">
                        {product.subcategory?.name || "-"}
                      </td>
                      <td className="text-center p-3">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(product)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit product"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete product"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Cost Calculation Box */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex justify-between items-center gap-4 p-4 bg-warning/10 rounded-lg border-2 border-warning/30">
              <span className="text-base font-semibold text-black">Total Cost:</span>
              <Badge variant="warning" className="text-xl font-bold">
                {totalProductsCost.toFixed(2)}
              </Badge>
            </div>
            <div className="flex justify-between items-center gap-4 p-4 bg-success/10 rounded-lg border-2 border-success/30">
              <span className="text-base font-semibold text-black">Total Value:</span>
              <Badge variant="success" className="text-xl font-bold">
                {totalProductsValue.toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

