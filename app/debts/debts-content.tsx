"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { addDebt, getDebtsByDate, getDebtsByDateRange, updateDebt, deleteDebt, toggleDebtPaidStatus, getAllDebts } from "@/app/actions/debts"
import { Debt, DebtFormData } from "@/types/database"
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
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

export function DebtsContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [dateFilter, setDateFilter] = useState<string>("custom")
  const [showAll, setShowAll] = useState(false)

  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)

  const [formData, setFormData] = useState<DebtFormData>({
    customer_name: "",
    product_name: "",
    product_cost: 0,
    amount: 0,
  })

  const loadDebts = async () => {
    setLoading(true)
    let result
    if (showAll) {
      result = await getAllDebts()
    } else if (dateFilter === "custom") {
      result = await getDebtsByDate(date)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getDebtsByDateRange(startDate, endDate)
    }
    if (result.success && result.data) {
      setDebts(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadDebts()
  }, [date, dateFilter, showAll])

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addDebt(date, formData)
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        customer_name: "",
        product_name: "",
        product_cost: 0,
        amount: 0,
      })
      await loadDebts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditClick = (debt: Debt) => {
    setEditingDebt(debt)
    setFormData({
      customer_name: debt.customer_name,
      product_name: debt.product_name,
      product_cost: debt.product_cost || 0,
      amount: debt.amount,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDebt) return

    const result = await updateDebt(editingDebt.id, formData)
    if (result.success) {
      setEditDialogOpen(false)
      setEditingDebt(null)
      setFormData({
        customer_name: "",
        product_name: "",
        product_cost: 0,
        amount: 0,
      })
      await loadDebts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleTogglePaidStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleDebtPaidStatus(id, !currentStatus)
    if (result.success) {
      await loadDebts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteDebt = async (id: string) => {
    if (!confirm("Are you sure you want to delete this debt?")) return

    const result = await deleteDebt(id)
    if (result.success) {
      await loadDebts()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Calculate totals
  const totalDebts = debts.reduce((sum, d) => sum + (d.amount || 0), 0)
  const unpaidDebts = debts.filter((d) => !d.is_paid)
  const totalUnpaid = unpaidDebts.reduce((sum, d) => sum + (d.amount || 0), 0)
  const totalPaid = debts.filter((d) => d.is_paid).reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Debts</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {showAll ? (
              <>Showing <span className="font-semibold">All Debts</span></>
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
            {showAll ? "Show Filtered" : "Show All Debts"}
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

      {/* Add Debt Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Debt
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Debt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDebt} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product_cost">Product Cost</Label>
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
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
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
              <Button type="submit" className="w-full sm:w-auto">Save Debt</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Debt Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Debt</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDebt} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-customer_name">Customer Name</Label>
              <Input
                id="edit-customer_name"
                value={formData.customer_name}
                onChange={(e) =>
                  setFormData({ ...formData, customer_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product_name">Product Name</Label>
              <Input
                id="edit-product_name"
                value={formData.product_name}
                onChange={(e) =>
                  setFormData({ ...formData, product_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product_cost">Product Cost</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingDebt(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Update Debt</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">Total Debts</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="text-base sm:text-lg px-3 sm:px-4 py-2">
              {totalDebts.toFixed(2)}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">Unpaid Debts</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="destructive" className="text-base sm:text-lg px-3 sm:px-4 py-2">
              {totalUnpaid.toFixed(2)}
            </Badge>
          </CardContent>
        </Card>
        <Card className="border-success/30 bg-success/5">
          <CardHeader>
            <CardTitle className="text-xs sm:text-sm font-medium">Paid Debts</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success" className="text-base sm:text-lg px-3 sm:px-4 py-2">
              {totalPaid.toFixed(2)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Debts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Debts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading debts..." />
            </div>
          ) : debts.length === 0 ? (
            <p className="text-muted-foreground">No debts for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="text-left p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Customer</th>
                    <th className="text-left p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Product</th>
                    <th className="text-right p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Cost</th>
                    <th className="text-right p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Amount</th>
                    <th className="text-center p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Status</th>
                    <th className="text-center p-2 sm:p-4 font-semibold text-slate-700 text-xs sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                      <td className="p-2 sm:p-4 font-medium text-slate-900 text-xs sm:text-base">{debt.customer_name}</td>
                      <td className="p-2 sm:p-4 text-slate-700 text-xs sm:text-base">{debt.product_name}</td>
                      <td className="text-right p-2 sm:p-4 text-slate-700 text-xs sm:text-base">${(debt.product_cost || 0).toFixed(2)}</td>
                      <td className="text-right p-2 sm:p-4 font-semibold text-slate-900 text-xs sm:text-base">{debt.amount.toFixed(2)}</td>
                      <td className="text-center p-2 sm:p-4">
                        <Badge
                          variant={debt.is_paid ? "default" : "destructive"}
                          className={debt.is_paid ? "bg-green-600 text-xs sm:text-sm" : "text-xs sm:text-sm"}
                        >
                          {debt.is_paid ? "Paid" : "Not Paid"}
                        </Badge>
                      </td>
                      <td className="text-center p-2 sm:p-4">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleTogglePaidStatus(debt.id, debt.is_paid)}
                            className={`h-8 w-8 sm:h-9 sm:w-9 transition-all duration-200 ${
                              debt.is_paid
                                ? "hover:bg-red-600 hover:text-white hover:border-red-600"
                                : "hover:bg-green-600 hover:text-white hover:border-green-600"
                            }`}
                            title={debt.is_paid ? "Mark as Not Paid" : "Mark as Paid"}
                          >
                            {debt.is_paid ? (
                              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(debt)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit debt"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete debt"
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
    </div>
  )
}

