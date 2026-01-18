"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { addTransformation, getTransformationsByDate, getTransformationsByDateRange, updateTransformation, deleteTransformation, getAllTransformations } from "@/app/actions/products"
import { DailyTransformation, TransformationFormData } from "@/types/database"
import { Plus, Pencil, Trash2, Search, Filter } from "lucide-react"
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
  
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [toDate, setToDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [dateFilter, setDateFilter] = useState<string>("custom")
  const [showAll, setShowAll] = useState(false)
  const [nameFilter, setNameFilter] = useState<string>("")
  const [netProfitFilter, setNetProfitFilter] = useState<string>("all") // "all", "net_profit", "not_net_profit"

  const [transformations, setTransformations] = useState<DailyTransformation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingTransformation, setEditingTransformation] = useState<DailyTransformation | null>(null)

  const [formData, setFormData] = useState<TransformationFormData>({
    name: "",
    quantity: 0,
    productCost: 0,
    sellingPrice: 0,
    isNetProfit: false,
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
      } else if (dateFilter === "dateRange") {
        result = await getTransformationsByDateRange(fromDate, toDate)
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
  }, [date, fromDate, toDate, dateFilter, showAll])

  const handleAddTransformation = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addTransformation(date, formData)
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        name: "",
        quantity: 0,
        productCost: 0,
        sellingPrice: 0,
        isNetProfit: false,
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
      productCost: transformation.productCost,
      sellingPrice: transformation.sellingPrice,
      isNetProfit: transformation.isNetProfit || false,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateTransformation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransformation) return

    const result = await updateTransformation(editingTransformation.id, formData)
    if (result.success) {
      // Update the local state instead of reloading
      setTransformations((prev) =>
        prev.map((t) =>
          t.id === editingTransformation.id
            ? {
                ...t,
                name: formData.name,
                quantity: formData.quantity,
                productCost: formData.productCost,
                sellingPrice: formData.sellingPrice,
                isNetProfit: formData.isNetProfit,
              }
            : t
        )
      )
      setEditDialogOpen(false)
      setEditingTransformation(null)
      setFormData({
        name: "",
        quantity: 0,
        productCost: 0,
        sellingPrice: 0,
        isNetProfit: false,
      })
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteTransformation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transformation?")) return

    const result = await deleteTransformation(id)
    if (result.success) {
      // Update local state instead of reloading
      setTransformations((prev) => prev.filter((t) => t.id !== id))
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Filter transformations by name and net profit status
  const filteredTransformations = transformations.filter((transformation) => {
    // Name filter
    if (nameFilter.trim() && !transformation.name.toLowerCase().includes(nameFilter.toLowerCase())) {
      return false
    }
    
    // Net profit filter
    if (netProfitFilter === "net_profit" && !transformation.isNetProfit) {
      return false
    }
    if (netProfitFilter === "not_net_profit" && transformation.isNetProfit) {
      return false
    }
    
    return true
  })

  // Calculate totals based on filtered transformations
  // DO NOT round during accumulation - only round final result for display
  // This ensures accurate calculations for decimal numbers like 0.85
  const totalSellingPrice = filteredTransformations.reduce((sum, t) => {
    const value = Number(t.sellingPrice) || 0
    return sum + value
  }, 0)
  
  const totalProductCost = filteredTransformations.reduce((sum, t) => {
    const productCost = Number(t.productCost) || 0
    const quantity = Number(t.quantity) || 0
    const cost = productCost * quantity
    return sum + cost
  }, 0)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Transformations</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {showAll ? (
              <>Showing <span className="font-semibold">All Transformations</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
                {netProfitFilter !== "all" && (
                  <span className="ml-2">• {netProfitFilter === "net_profit" ? "Net Profit Only" : "Not Net Profit Only"}</span>
                )}
              </>
            ) : dateFilter === "custom" ? (
              <>Date: <span className="font-semibold">{date}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
                {netProfitFilter !== "all" && (
                  <span className="ml-2">• {netProfitFilter === "net_profit" ? "Net Profit Only" : "Not Net Profit Only"}</span>
                )}
              </>
            ) : dateFilter === "dateRange" ? (
              <>Date Range: <span className="font-semibold">{fromDate} to {toDate}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
                {netProfitFilter !== "all" && (
                  <span className="ml-2">• {netProfitFilter === "net_profit" ? "Net Profit Only" : "Not Net Profit Only"}</span>
                )}
              </>
            ) : (
              <>Period: <span className="font-semibold">{getDateRangeByFilter(dateFilter).startDate} to {getDateRangeByFilter(dateFilter).endDate}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
                {netProfitFilter !== "all" && (
                  <span className="ml-2">• {netProfitFilter === "net_profit" ? "Net Profit Only" : "Not Net Profit Only"}</span>
                )}
              </>
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
                  if (filter !== "custom" && filter !== "dateRange") {
                    const { endDate } = getDateRangeByFilter(filter)
                    setDate(endDate)
                  }
                }}
                className="w-full sm:w-auto"
              >
                <option value="custom">Custom Date</option>
                <option value="dateRange">Date Range</option>
                <option value="yesterday">Yesterday</option>
                <option value="1day">1 Day</option>
                <option value="1week">1 Week</option>
                <option value="1month">1 Month</option>
                <option value="1year">1 Year</option>
              </Select>
              {dateFilter === "custom" ? (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <Label htmlFor="date-input" className="text-xs text-gray-600">Date</Label>
                  <Input
                    id="date-input"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value)
                      setDateFilter("custom")
                    }}
                    className="w-full sm:w-auto"
                  />
                </div>
              ) : dateFilter === "dateRange" ? (
                <div className="flex flex-col gap-1 w-full sm:w-auto">
                  <Label className="text-xs text-gray-600">Date Range</Label>
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <Label htmlFor="from-date" className="text-xs text-gray-500">From</Label>
                      <Input
                        id="from-date"
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value)
                          if (e.target.value > toDate) {
                            setToDate(e.target.value)
                          }
                        }}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <Label htmlFor="to-date" className="text-xs text-gray-500">To</Label>
                      <Input
                        id="to-date"
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value)
                          if (e.target.value < fromDate) {
                            setFromDate(e.target.value)
                          }
                        }}
                        min={fromDate}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
          <div className="relative w-full sm:w-auto min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Filter by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="w-full pl-10"
            />
          </div>
          <div className="relative w-full sm:w-auto min-w-[180px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select
              value={netProfitFilter}
              onChange={(e) => setNetProfitFilter(e.target.value)}
              className="w-full pl-10"
            >
              <option value="all">All Transformations</option>
              <option value="net_profit">Net Profit Only</option>
              <option value="not_net_profit">Not Net Profit</option>
            </Select>
          </div>
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
                <Label htmlFor="productCost">Product Cost</Label>
                <Input
                  id="productCost"
                  type="number"
                  step="0.01"
                  value={formData.productCost}
                  onChange={(e) =>
                    setFormData({ ...formData, productCost: parseFloat(e.target.value) || 0 })
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isNetProfit"
                checked={formData.isNetProfit}
                onChange={(e) =>
                  setFormData({ ...formData, isNetProfit: e.target.checked })
                }
              />
              <Label htmlFor="isNetProfit" className="text-sm font-normal cursor-pointer">
                This is a net profit transformation
              </Label>
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
                <Label htmlFor="edit-productCost">Product Cost</Label>
                <Input
                  id="edit-productCost"
                  type="number"
                  step="0.01"
                  value={formData.productCost}
                  onChange={(e) =>
                    setFormData({ ...formData, productCost: parseFloat(e.target.value) || 0 })
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isNetProfit"
                checked={formData.isNetProfit}
                onChange={(e) =>
                  setFormData({ ...formData, isNetProfit: e.target.checked })
                }
              />
              <Label htmlFor="edit-isNetProfit" className="text-sm font-normal cursor-pointer">
                This is a net profit transformation
              </Label>
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
        <CardContent className="mt-4">
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
          ) : filteredTransformations.length === 0 ? (
            <p className="text-muted-foreground">
              {nameFilter.trim() || netProfitFilter !== "all"
                ? "No transformations found matching your filters."
                : "No transformations for this date."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Quantity</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Product Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Selling Price</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-sm">Net Profit</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransformations.map((transformation, index) => {
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString)
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    }
                    return (
                    <tr key={transformation.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}>
                      <td className="p-3 text-gray-700 text-sm">{formatDate(transformation.date)}</td>
                      <td className="p-3 font-medium text-gray-900 text-sm">{transformation.name}</td>
                      <td className="text-right p-3 text-gray-700 text-sm">{transformation.quantity.toFixed(2)}</td>
                      <td className="text-right p-3 text-gray-700 text-sm">{(transformation.productCost * transformation.quantity).toFixed(2)}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{transformation.sellingPrice.toFixed(2)}</td>
                      <td className="text-center p-3">
                        {transformation.isNetProfit ? (
                          <Badge variant="success" className="text-xs">Net Profit</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Regular</Badge>
                        )}
                      </td>
                      <td className="text-center p-3">
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
                    )
                  })}
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
        <CardContent className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Selling Price</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Product Cost</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalProductCost.toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

