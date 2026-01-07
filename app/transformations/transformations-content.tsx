"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { addTransformation, getTransformationsByDate, getTransformationsByDateRange, updateTransformation, deleteTransformation, getAllTransformations } from "@/app/actions/products"
import { DailyTransformation, TransformationFormData } from "@/types/database"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const getDateRangeByFilter = (filter: string): { startDate: string; endDate: string } => {
  const today = new Date()
  const endDate = new Date(today)
  const startDate = new Date(today)
  
  switch (filter) {
    case "yesterday":
      startDate.setDate(today.getDate() - 1)
      endDate.setDate(today.getDate() - 1)
      break
    case "1day":
      startDate.setDate(today.getDate() - 1)
      endDate.setDate(today.getDate())
      break
    case "1week":
      startDate.setDate(today.getDate() - 6)
      endDate.setDate(today.getDate())
      break
    case "1month":
      startDate.setDate(today.getDate() - 29)
      endDate.setDate(today.getDate())
      break
    case "1year":
      startDate.setDate(today.getDate() - 364)
      endDate.setDate(today.getDate())
      break
    default:
      const todayStr = today.toISOString().split("T")[0]
      return { startDate: todayStr, endDate: todayStr }
  }
  
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0]
  }
}

export function TransformationsContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [dateFilter, setDateFilter] = useState<string>("custom")
  const [showAll, setShowAll] = useState(false)

  const [transformations, setTransformations] = useState<DailyTransformation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    try {
      let result
      if (showAll) {
        result = await getAllTransformations()
      } else if (dateFilter === "custom") {
        result = await getTransformationsByDate(date)
      } else {
        const { startDate, endDate } = getDateRangeByFilter(dateFilter)
        result = await getTransformationsByDateRange(startDate, endDate)
      }
      if (result.success) {
        setTransformations(result.data || [])
      } else {
        console.error("Error loading transformations:", result.error)
        setError(result.error || "Failed to load transformations")
        setTransformations([])
      }
    } catch (error) {
      console.error("Failed to load transformations:", error)
      setError("An unexpected error occurred while loading transformations")
      setTransformations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransformations()
  }, [date, dateFilter, showAll])

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
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Transformations</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {showAll ? (
              <>Showing <span className="font-semibold">All Transformations</span></>
            ) : dateFilter === "custom" ? (
              <>Date: <span className="font-semibold">{date}</span></>
            ) : (
              <>Period: <span className="font-semibold">{getDateRangeByFilter(dateFilter).startDate} to {getDateRangeByFilter(dateFilter).endDate}</span></>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant={showAll ? "default" : "outline"}
            onClick={() => {
              setShowAll(!showAll)
              if (!showAll) {
                setDateFilter("custom")
              }
            }}
            className="w-full sm:w-auto"
          >
            {showAll ? "Show Filtered" : "Show All Transformations"}
          </Button>
          {!showAll && (
            <>
              <Select
                value={dateFilter}
                onChange={(e) => {
                  const filter = e.target.value
                  setDateFilter(filter)
                  if (filter !== "custom") {
                    const { endDate } = getDateRangeByFilter(filter)
                    setDate(endDate)
                  }
                }}
                className="w-full sm:w-auto"
              >
                <option value="custom">Custom Date</option>
                <option value="yesterday">Yesterday</option>
                <option value="1day">1 Day</option>
                <option value="1week">1 Week</option>
                <option value="1month">1 Month</option>
                <option value="1year">1 Year</option>
              </Select>
              <Input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setDateFilter("custom")
                }}
                className="w-full sm:w-auto"
              />
            </>
          )}
        </div>
      </div>

      {/* Add Transformation Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transformation
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Transformation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTransformation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Save Transformation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Transformation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Transformation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTransformation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingTransformation(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Update Transformation</Button>
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
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading transformations..." />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-red-600 font-semibold">Error loading transformations</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={loadTransformations} variant="outline" className="mt-2">
                Retry
              </Button>
            </div>
          ) : transformations.length === 0 ? (
            <p className="text-muted-foreground">No transformations for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="text-left p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Name</th>
                    <th className="text-right p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Quantity</th>
                    <th className="text-right p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Dollar Rate</th>
                    <th className="text-right p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Selling Price</th>
                    <th className="text-center p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transformations.map((transformation) => (
                    <tr key={transformation.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                      <td className="p-2 sm:p-4 font-medium text-slate-900 text-xs sm:text-base">{transformation.name}</td>
                      <td className="text-right p-2 sm:p-4 text-slate-700 text-xs sm:text-base">{transformation.quantity.toFixed(2)}</td>
                      <td className="text-right p-2 sm:p-4 text-slate-700 text-xs sm:text-base">{transformation.dollarRate.toFixed(2)}</td>
                      <td className="text-right p-2 sm:p-4 font-semibold text-slate-900 text-xs sm:text-base">{transformation.sellingPrice.toFixed(2)}</td>
                      <td className="text-center p-2 sm:p-4">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(transformation)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit transformation"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteTransformation(transformation.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete transformation"
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

      {/* Totals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Selling Price</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-md">
              <p className="text-xs sm:text-sm font-medium text-slate-700">Total Cost Price (Dollar)</p>
              <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg p-2 sm:p-3 border border-amber-200">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                <Badge variant="outline" className="text-lg sm:text-xl px-3 sm:px-5 py-2 sm:py-3 border-2 border-amber-400 bg-amber-50 text-amber-900 font-bold">
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

