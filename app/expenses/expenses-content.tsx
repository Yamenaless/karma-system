"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { addExpense, getExpensesByDate, getExpensesByDateRange, updateExpense, deleteExpense, getAllExpenses } from "@/app/actions/expenses"
import { DailyExpense, ExpenseFormData } from "@/types/database"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
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

export function ExpensesContent() {
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

  const [expenses, setExpenses] = useState<DailyExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null)

  const [formData, setFormData] = useState<ExpenseFormData>({
    name: "",
    amount: 0,
  })

  const loadExpenses = async () => {
    setLoading(true)
    let result
    if (showAll) {
      result = await getAllExpenses()
    } else if (dateFilter === "custom") {
      result = await getExpensesByDate(date)
    } else if (dateFilter === "dateRange") {
      result = await getExpensesByDateRange(fromDate, toDate)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getExpensesByDateRange(startDate, endDate)
    }
    if (result.success && result.data) {
      setExpenses(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [date, fromDate, toDate, dateFilter, showAll])

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await addExpense(date, formData)
    if (result.success) {
      setDialogOpen(false)
      setFormData({
        name: "",
        amount: 0,
      })
      await loadExpenses()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleEditClick = (expense: DailyExpense) => {
    setEditingExpense(expense)
    setFormData({
      name: expense.name,
      amount: expense.amount,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return

    const result = await updateExpense(editingExpense.id, formData)
    if (result.success) {
      setEditDialogOpen(false)
      setEditingExpense(null)
      setFormData({
        name: "",
        amount: 0,
      })
      await loadExpenses()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return

    const result = await deleteExpense(id)
    if (result.success) {
      await loadExpenses()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Filter expenses by name
  const filteredExpenses = expenses.filter((expense) => {
    if (!nameFilter.trim()) return true
    return expense.name.toLowerCase().includes(nameFilter.toLowerCase())
  })

  // Calculate total expenses based on filtered expenses
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Expenses</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {showAll ? (
              <>Showing <span className="font-semibold">All Expenses</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
              </>
            ) : dateFilter === "custom" ? (
              <>Date: <span className="font-semibold">{date}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
              </>
            ) : dateFilter === "dateRange" ? (
              <>Date Range: <span className="font-semibold">{fromDate} to {toDate}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
              </>
            ) : (
              <>Period: <span className="font-semibold">{getDateRangeByFilter(dateFilter).startDate} to {getDateRangeByFilter(dateFilter).endDate}</span>
                {nameFilter.trim() && <span className="ml-2">• Filtered by: <span className="font-semibold">"{nameFilter}"</span></span>}
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
            {showAll ? "Show Filtered" : "Show All Expenses"}
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
        </div>
      </div>

      {/* Add Expense Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Add New Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4">
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
              <Button type="submit" className="w-full sm:w-auto">Save Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateExpense} className="space-y-4">
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
                  setEditingExpense(null)
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">Update Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading expenses..." />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <p className="text-muted-foreground">
              {nameFilter.trim() ? `No expenses found matching "${nameFilter}".` : "No expenses for this date."}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-700 text-sm">Name</th>
                    <th className="text-right p-3 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-center p-3 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense, index) => {
                    const formatDate = (dateString: string) => {
                      const date = new Date(dateString)
                      return date.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    }
                    return (
                    <tr key={expense.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    }`}>
                      <td className="p-3 text-gray-700 text-sm">{formatDate(expense.date)}</td>
                      <td className="p-3 font-medium text-gray-900 text-sm">{expense.name}</td>
                      <td className="text-right p-3 font-semibold text-gray-900 text-sm">{expense.amount.toFixed(2)}</td>
                      <td className="text-center p-3">
                        <div className="flex justify-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(expense)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit expense"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete expense"
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

      {/* Total Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="flex justify-center">
            <Badge variant="default" className="text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3">
              {totalExpenses.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

