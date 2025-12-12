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
  updateParanizSale,
  deleteParanizSale
} from "@/app/actions/paraniz"
import { DailyParanizSale, ParanizSaleFormData } from "@/types/database"
import { Plus, Pencil, Trash2 } from "lucide-react"

export function ParanizContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

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
    const result = await getParanizSalesByDate(date)
    if (result.success && result.data) {
      setParanizSales(result.data)
    }
    setSalesLoading(false)
  }

  useEffect(() => {
    loadParanizSales()
  }, [date])

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
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Paraniz</h1>
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

      {/* Add Paraniz Sale Button */}
      <Dialog open={salesDialogOpen} onOpenChange={setSalesDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Paraniz Sale
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Paraniz Sale</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSalesDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Sale</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Paraniz Sale Dialog */}
      <Dialog open={editSalesDialogOpen} onOpenChange={setEditSalesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Paraniz Sale</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditSalesDialogOpen(false)
                  setEditingSale(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Sale</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Paraniz Sales Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Paraniz Sales</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("ALL")}
              >
                All
              </Button>
              <Button
                variant={categoryFilter === "FATURA" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("FATURA")}
              >
                FATURA
              </Button>
              <Button
                variant={categoryFilter === "KONTOR" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("KONTOR")}
              >
                KONTOR
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {salesLoading ? (
            <p>Loading...</p>
          ) : filteredSales.length === 0 ? (
            <p className="text-muted-foreground">No paraniz sales for this date{categoryFilter !== "ALL" ? ` (${categoryFilter})` : ""}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Category</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Subscription Number</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Cost</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{sale.name}</td>
                      <td className="p-4">
                        <Badge variant={sale.category === "FATURA" ? "default" : "secondary"} className="font-semibold">
                          {sale.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-slate-700">{sale.subscriptionNumber || "-"}</td>
                      <td className="text-right p-4 font-semibold text-slate-900">{sale.amount.toFixed(2)}</td>
                      <td className="text-right p-4 font-semibold text-slate-900">{sale.cost.toFixed(2)}</td>
                      <td className="text-center p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditSaleClick(sale)}
                            className="h-9 w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit paraniz sale"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteSale(sale.id)}
                            className="h-9 w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete paraniz sale"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <p className="text-sm font-medium text-slate-600">Total Paraniz Sales Amount</p>
              <Badge variant="default" className="text-xl px-5 py-3 w-full justify-center">
                {totalParanizSales.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
              <p className="text-sm font-medium text-slate-600">Total Paraniz Sales Cost</p>
              <Badge variant="destructive" className="text-xl px-5 py-3 w-full justify-center">
                {totalParanizCost.toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

