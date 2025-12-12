"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { addExpense, getExpensesByDate, updateExpense, deleteExpense } from "@/app/actions/expenses"
import { DailyExpense, ExpenseFormData } from "@/types/database"
import { Plus, Pencil, Trash2 } from "lucide-react"

export function ExpensesContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

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
    const result = await getExpensesByDate(date)
    if (result.success && result.data) {
      setExpenses(result.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadExpenses()
  }, [date])

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

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Expenses</h1>
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

      {/* Add Expense Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
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
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false)
                  setEditingExpense(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Expense</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-muted-foreground">No expenses for this date.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Amount</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-900">{expense.name}</td>
                      <td className="text-right p-4 font-semibold text-slate-900">{expense.amount.toFixed(2)}</td>
                      <td className="text-center p-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(expense)}
                            className="h-9 w-9 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                            title="Edit expense"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="h-9 w-9 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
                            title="Delete expense"
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

      {/* Total Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Badge variant="default" className="text-lg px-6 py-3">
              {totalExpenses.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

