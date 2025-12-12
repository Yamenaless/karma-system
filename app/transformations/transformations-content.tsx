"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { addTransformation, getTransformationsByDate, updateTransformation, deleteTransformation } from "@/app/actions/products"
import { DailyTransformation, TransformationFormData } from "@/types/database"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"

export function TransformationsContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

  const [transformations, setTransformations] = useState<DailyTransformation[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTransformation, setEditingTransformation] = useState<DailyTransformation | null>(null)

  const [formData, setFormData] = useState<TransformationFormData>({
    name: "",
    quantity: 0,
    dollarRate: 0,
    sellingPrice: 0,
  })

  const loadTransformations = async () => {
    setLoading(true)
    const result = await getTransformationsByDate(date)
    if (result.success && result.data) {
      setTransformations(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTransformations()
  }, [date])

  const handleAddTransformation = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addTransformation(date, formData)
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        name: "",
        quantity: 0,
        dollarRate: 0,
        sellingPrice: 0,
      })
      await loadTransformations()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditClick = (transformation: DailyTransformation) => {
    setEditingTransformation(transformation)
    setFormData({
      name: transformation.name,
      quantity: transformation.quantity,
      dollarRate: transformation.dollarRate,
      sellingPrice: transformation.sellingPrice,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateTransformation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransformation) return

    const result = await updateTransformation(editingTransformation.id, formData)
    if (result.success) {
      setEditDialogOpen(false)
      setEditingTransformation(null)
      setFormData({
        name: "",
        quantity: 0,
        dollarRate: 0,
        sellingPrice: 0,
      })
      await loadTransformations()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteTransformation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transformation?")) return

    const result = await deleteTransformation(id)
    if (result.success) {
      await loadTransformations()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Calculate totals
  const totalSellingPrice = transformations.reduce((sum, t) => sum + (t.sellingPrice || 0), 0)
  const totalCostPriceInDollar = transformations.reduce(
    (sum, t) => sum + (t.dollarRate * t.quantity || 0),
    0
  )

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Transformations</h1>
          <p className="text-muted-foreground mt-1">
            Date: <span className="font-semibold">{date}</span>
          </p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Add Transformation Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transformation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transformation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTransformation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
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
                <Label htmlFor="quantity">Quantity</Label>
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
                <Label htmlFor="dollarRate">Dollar Rate (Cost per unit in $)</Label>
                <Input
                  id="dollarRate"
                  type="number"
                  step="0.01"
                  value={formData.dollarRate}
                  onChange={(e) =>
                    setFormData({ ...formData, dollarRate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Transformation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Transformation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transformation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTransformation} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
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
                <Label htmlFor="edit-quantity">Quantity</Label>
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
                <Label htmlFor="edit-dollarRate">Dollar Rate (Cost per unit in $)</Label>
                <Input
                  id="edit-dollarRate"
                  type="number"
                  step="0.01"
                  value={formData.dollarRate}
                  onChange={(e) =>
                    setFormData({ ...formData, dollarRate: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sellingPrice">Selling Price</Label>
                <Input
                  id="edit-sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingTransformation(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Transformation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transformations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transformations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : transformations.length === 0 ? (
            <p className="text-muted-foreground">No transformations for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Quantity</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Dollar Rate</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Selling Price</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transformations.map((transformation) => (
                    <tr key={transformation.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{transformation.name}</td>
                      <td className="text-right p-4 text-slate-700">{transformation.quantity.toFixed(2)}</td>
                      <td className="text-right p-4 text-slate-700">{transformation.dollarRate.toFixed(2)}</td>
                      <td className="text-right p-4 font-semibold text-slate-900">{transformation.sellingPrice.toFixed(2)}</td>
                      <td className="text-center p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(transformation)}
                            className="h-9 w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit transformation"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTransformation(transformation.id)}
                            className="h-9 w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete transformation"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Totals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-sm font-medium text-slate-600">Total Selling Price</p>
              <Badge variant="default" className="text-xl px-5 py-3 w-full justify-center">
                {totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-md">
              <p className="text-sm font-medium text-slate-700">Total Cost Price (Dollar)</p>
              <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <DollarSign className="h-6 w-6 text-amber-600" />
                <Badge variant="outline" className="text-xl px-5 py-3 border-2 border-amber-400 bg-amber-50 text-amber-900 font-bold">
                  {totalCostPriceInDollar.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

