"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { 
  addParanizSale,
  getParanizSalesByDate,
  getParanizSalesByDateRange,
  updateParanizSale,
  deleteParanizSale,
  getAllParanizSales
} from "@/app/actions/paraniz"
import { DailyParanizSale, ParanizSaleFormData } from "@/types/database"
import { Plus, Pencil, Trash2 } from "lucide-react"
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

export function ParanizContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [dateFilter, setDateFilter] = useState<string>("custom")
  const [showAll, setShowAll] = useState(false)

  const [paranizSales, setParanizSales] = useState<DailyParanizSale[]>([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesDialogOpen, setSalesDialogOpen] = useState(false)
  const [editSalesDialogOpen, setEditSalesDialogOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<DailyParanizSale | null>(null)

  const [saleFormData, setSaleFormData] = useState<ParanizSaleFormData>({
    name: "",
    amount: 0,
    cost: 0,
    category: "FATURA",
    subscriptionNumber: "",
  })
  
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "FATURA" | "KONTOR">("ALL")

  const loadParanizSales = async () => {
    setSalesLoading(true)
    let result
    if (showAll) {
      result = await getAllParanizSales()
    } else if (dateFilter === "custom") {
      result = await getParanizSalesByDate(date)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getParanizSalesByDateRange(startDate, endDate)
    }
    if (result.success && result.data) {
      setParanizSales(result.data)
    }
    setSalesLoading(false)
  }

  useEffect(() => {
    loadParanizSales()
  }, [date, dateFilter, showAll])

  // Sales handlers
  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addParanizSale(date, saleFormData.name, saleFormData.amount, saleFormData.cost, saleFormData.category, saleFormData.subscriptionNumber)
    if (result.success) {
      setSalesDialogOpen(false)
      setSaleFormData({
        name: "",
        amount: 0,
        cost: 0,
        category: "FATURA",
        subscriptionNumber: "",
      })
      await loadParanizSales()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditSaleClick = (sale: DailyParanizSale) => {
    setEditingSale(sale)
    setSaleFormData({
      name: sale.name,
      amount: sale.amount,
      cost: sale.cost || 0,
      category: sale.category || "FATURA",
      subscriptionNumber: sale.subscriptionNumber || "",
    })
    setEditSalesDialogOpen(true)
  }

  const handleUpdateSale = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSale) return

    const result = await updateParanizSale(editingSale.id, saleFormData.name, saleFormData.amount, saleFormData.cost, saleFormData.category, saleFormData.subscriptionNumber)
    if (result.success) {
      setEditSalesDialogOpen(false)
      setEditingSale(null)
      setSaleFormData({
        name: "",
        amount: 0,
        cost: 0,
        category: "FATURA",
        subscriptionNumber: "",
      })
      await loadParanizSales()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteSale = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale?")) return

    const result = await deleteParanizSale(id)
    if (result.success) {
      await loadParanizSales()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Filter sales by category
  const filteredSales = categoryFilter === "ALL" 
    ? paranizSales 
    : paranizSales.filter(s => s.category === categoryFilter)

  // Calculate totals
  const totalParanizSales = filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0)
  const totalParanizCost = filteredSales.reduce((sum, s) => sum + (s.cost || 0), 0)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Paraniz</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {showAll ? (
              <>Showing <span className="font-semibold">All Paraniz Sales</span></>
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
            {showAll ? "Show Filtered" : "Show All Paraniz"}
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

      {/* Add Paraniz Sale Button */}
      <Dialog open={salesDialogOpen} onOpenChange={setSalesDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Paraniz Sale
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Paraniz Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSale} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sale-name">Name</Label>
              <Input
                id="sale-name"
                value={saleFormData.name}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sale-amount">Amount</Label>
                <Input
                  id="sale-amount"
                  type="number"
                  step="0.01"
                  value={saleFormData.amount}
                  onChange={(e) =>
                    setSaleFormData({ ...saleFormData, amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-cost">Cost</Label>
                <Input
                  id="sale-cost"
                  type="number"
                  step="0.01"
                  value={saleFormData.cost}
                  onChange={(e) =>
                    setSaleFormData({ ...saleFormData, cost: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-category">Category</Label>
              <Select
                id="sale-category"
                value={saleFormData.category}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, category: e.target.value as "FATURA" | "KONTOR" })
                }
                required
              >
                <option value="FATURA">FATURA</option>
                <option value="KONTOR">KONTOR</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-subscription-number">Subscription Number</Label>
              <Input
                id="sale-subscription-number"
                value={saleFormData.subscriptionNumber}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, subscriptionNumber: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSalesDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Save Sale</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Paraniz Sale Dialog */}
      <Dialog open={editSalesDialogOpen} onOpenChange={setEditSalesDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Paraniz Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSale} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sale-name">Name</Label>
              <Input
                id="edit-sale-name"
                value={saleFormData.name}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-sale-amount">Amount</Label>
                <Input
                  id="edit-sale-amount"
                  type="number"
                  step="0.01"
                  value={saleFormData.amount}
                  onChange={(e) =>
                    setSaleFormData({ ...saleFormData, amount: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sale-cost">Cost</Label>
                <Input
                  id="edit-sale-cost"
                  type="number"
                  step="0.01"
                  value={saleFormData.cost}
                  onChange={(e) =>
                    setSaleFormData({ ...saleFormData, cost: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sale-category">Category</Label>
              <Select
                id="edit-sale-category"
                value={saleFormData.category}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, category: e.target.value as "FATURA" | "KONTOR" })
                }
                required
              >
                <option value="FATURA">FATURA</option>
                <option value="KONTOR">KONTOR</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sale-subscription-number">Subscription Number</Label>
              <Input
                id="edit-sale-subscription-number"
                value={saleFormData.subscriptionNumber}
                onChange={(e) =>
                  setSaleFormData({ ...saleFormData, subscriptionNumber: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditSalesDialogOpen(false)
                  setEditingSale(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Update Sale</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Paraniz Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl">Paraniz Sales</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant={categoryFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("ALL")}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                variant={categoryFilter === "FATURA" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("FATURA")}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                FATURA
              </Button>
              <Button
                variant={categoryFilter === "KONTOR" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("KONTOR")}
                className="flex-1 sm:flex-initial text-xs sm:text-sm"
              >
                KONTOR
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-4">
          {salesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading paraniz sales..." />
            </div>
          ) : filteredSales.length === 0 ? (
            <p className="text-muted-foreground">No paraniz sales for this date{categoryFilter !== "ALL" ? ` (${categoryFilter})` : ""}.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Subscription Number</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Cost</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <tr key={sale.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}>
                      <td className="p-3 font-medium text-gray-900 text-sm">{sale.name}</td>
                      <td className="p-3">
                        <Badge variant={sale.category === "FATURA" ? "default" : "secondary"} className="font-medium text-xs">
                          {sale.category}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-600 text-sm">{sale.subscriptionNumber || "-"}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{sale.amount.toFixed(2)}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{sale.cost.toFixed(2)}</td>
                      <td className="text-center p-2 sm:p-4">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditSaleClick(sale)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit paraniz sale"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteSale(sale.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete paraniz sale"
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
        <CardContent className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-info/10 border-2 border-info/30">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Total Paraniz Sales Amount</p>
              <Badge variant="info" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalParanizSales.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Total Paraniz Sales Cost</p>
              <Badge variant="destructive" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalParanizCost.toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

