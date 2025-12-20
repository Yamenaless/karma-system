"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { getTransformationTotalsByDate, getTransformationTotalsByDateRange } from "@/app/actions/products"
import { getCashByDate, getPreviousDayCash, upsertCash } from "@/app/actions/cash"
import { getTotalExpensesByDate, getTotalExpensesByDateRange } from "@/app/actions/expenses"
import { getParanizSalesTotalByDate, getParanizSalesTotalByDateRange } from "@/app/actions/paraniz"
import { getUnpaidDebts } from "@/app/actions/debts"
import { Debt } from "@/types/database"
import { DollarSign, AlertCircle, X } from "lucide-react"
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

export function DashboardContent() {
  const router = useRouter()
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [dateFilter, setDateFilter] = useState<string>("custom")

  const [cashInBoxYesterday, setCashInBoxYesterday] = useState(0)
  const [cashInBoxToday, setCashInBoxToday] = useState(0)
  const [dollarToTLRate, setDollarToTLRate] = useState(0)
  const [cashLoading, setCashLoading] = useState(true)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalParanizSales, setTotalParanizSales] = useState(0)
  const [transformationTotals, setTransformationTotals] = useState({
    totalSellingPrice: 0,
    totalCostPriceInDollar: 0,
  })
  const [unpaidDebts, setUnpaidDebts] = useState<Debt[]>([])
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)

  const loadCash = async () => {
    setCashLoading(true)
    
    // Load previous day's cashInBoxToday
    const prevCashResult = await getPreviousDayCash(date)
    if (prevCashResult.success) {
      setCashInBoxYesterday(prevCashResult.data || 0)
    }

    // Load today's cash data
    const cashResult = await getCashByDate(date)
    if (cashResult.success && cashResult.data) {
      setCashInBoxToday(cashResult.data.cashInBoxToday || 0)
      setDollarToTLRate(cashResult.data.dollarToTLRate || 0)
      // If we have saved data, use the saved yesterday value
      if (cashResult.data.cashInBoxYesterday !== null) {
        setCashInBoxYesterday(cashResult.data.cashInBoxYesterday)
      }
    }
    
    setCashLoading(false)
  }

  const loadTotalExpenses = async () => {
    let result
    if (dateFilter === "custom") {
      result = await getTotalExpensesByDate(date)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getTotalExpensesByDateRange(startDate, endDate)
    }
    if (result.success) {
      setTotalExpenses(result.total)
    }
  }

  const loadTransformationTotals = async () => {
    let result
    if (dateFilter === "custom") {
      result = await getTransformationTotalsByDate(date)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getTransformationTotalsByDateRange(startDate, endDate)
    }
    if (result.success && result.totals) {
      setTransformationTotals(result.totals)
    }
  }

  const loadParanizSalesTotal = async () => {
    let result
    if (dateFilter === "custom") {
      result = await getParanizSalesTotalByDate(date)
    } else {
      const { startDate, endDate } = getDateRangeByFilter(dateFilter)
      result = await getParanizSalesTotalByDateRange(startDate, endDate)
    }
    if (result.success) {
      setTotalParanizSales(result.total)
    }
  }

  const loadUnpaidDebts = async () => {
    const result = await getUnpaidDebts()
    if (result.success && result.data) {
      setUnpaidDebts(result.data)
      // Auto-open reminder dialog if there are unpaid debts
      if (result.data.length > 0) {
        setReminderDialogOpen(true)
      }
    }
  }

  useEffect(() => {
    loadCash()
    loadTotalExpenses()
    loadTransformationTotals()
    loadParanizSalesTotal()
    loadUnpaidDebts()
  }, [date, dateFilter])


  const handleCashSave = async () => {
    const result = await upsertCash(date, cashInBoxYesterday, cashInBoxToday, dollarToTLRate)
    if (result.success) {
      alert("Cash data saved successfully!")
      await loadTransformationTotals()
      await loadParanizSalesTotal()
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Calculate totals
  const totalCostPriceInTL = transformationTotals.totalCostPriceInDollar * dollarToTLRate
  const netTotal = transformationTotals.totalSellingPrice + totalParanizSales
  
  // Calculate net total with cash and expenses: netTotal + cashInBoxYesterday - totalExpenses
  const netTotalWithCashAndExpenses = netTotal + cashInBoxYesterday - totalExpenses
  
  // Calculate cash difference: cashInBoxToday - netTotalWithCashAndExpenses
  // If result is negative, it means shortage (نقص)
  // If result is positive, it means excess (زيادة)
  const cashDifference = cashInBoxToday - netTotalWithCashAndExpenses
  const formattedCashDifference = cashDifference === 0 
    ? "0" 
    : cashDifference > 0 
    ? `+${cashDifference.toFixed(2)}` 
    : `${cashDifference.toFixed(2)}`

  // Calculate total unpaid amount
  const totalUnpaidAmount = unpaidDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0)

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Daily Accounting System</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {dateFilter === "custom" ? (
              <>Date: <span className="font-semibold">{date}</span></>
            ) : (
              <>Period: <span className="font-semibold">{getDateRangeByFilter(dateFilter).startDate} to {getDateRangeByFilter(dateFilter).endDate}</span></>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {unpaidDebts.length > 0 && (
            <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Unpaid Debts ({unpaidDebts.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Unpaid Debts Reminder
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 sm:p-4 rounded-lg bg-red-50 border-2 border-red-200">
                    <p className="text-xs sm:text-sm font-semibold text-red-900 mb-2">
                      Total Unpaid Amount: <span className="text-base sm:text-lg">{totalUnpaidAmount.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-red-700">
                      You have {unpaidDebts.length} unpaid debt{unpaidDebts.length > 1 ? "s" : ""} that need attention.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-700 text-sm sm:text-base">Unpaid Debts List:</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[500px]">
                        <thead>
                          <tr className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                            <th className="text-left p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Date</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Customer</th>
                            <th className="text-left p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Product</th>
                            <th className="text-right p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Cost</th>
                            <th className="text-right p-2 sm:p-3 font-semibold text-slate-700 text-xs sm:text-sm">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unpaidDebts.map((debt) => (
                            <tr key={debt.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-slate-600">{debt.date}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm font-medium text-slate-900">{debt.customer_name}</td>
                              <td className="p-2 sm:p-3 text-xs sm:text-sm text-slate-700">{debt.product_name}</td>
                              <td className="text-right p-2 sm:p-3 text-xs sm:text-sm text-slate-700">${(debt.product_cost || 0).toFixed(2)}</td>
                              <td className="text-right p-2 sm:p-3 text-xs sm:text-sm font-semibold text-slate-900">{debt.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setReminderDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setReminderDialogOpen(false)
                        router.push("/debts")
                      }}
                      className="w-full sm:w-auto"
                    >
                      Go to Debts Page
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
          </div>
        </div>
      </div>

      {/* Dollar to TL Rate Field */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <Label htmlFor="dollarToTLRate" className="text-sm sm:text-base font-semibold text-slate-700">
              <span className="hidden sm:inline">سعر صرف الدولار مقابل الليرة التركية (Dollar to TL Rate):</span>
              <span className="sm:hidden">Dollar to TL Rate:</span>
            </Label>
            <Input
              id="dollarToTLRate"
              type="number"
              step="0.01"
              value={dollarToTLRate}
              onChange={(e) =>
                setDollarToTLRate(parseFloat(e.target.value) || 0)
              }
              className="w-full sm:w-40"
            />
            <Button onClick={handleCashSave} variant="outline" className="w-full sm:w-auto">
              حفظ سعر الصرف
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Selling Price</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {transformationTotals.totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-md">
              <p className="text-xs sm:text-sm font-medium text-slate-700">Total Cost Price (Dollar)</p>
              <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg p-2 sm:p-3 border border-amber-200">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                <Badge variant="outline" className="text-lg sm:text-xl px-3 sm:px-5 py-2 sm:py-3 border-2 border-amber-400 bg-amber-50 text-amber-900 font-bold">
                  {transformationTotals.totalCostPriceInDollar.toFixed(2)}
                </Badge>
              </div>
              {dollarToTLRate > 0 && (
                <div className="mt-2 bg-gradient-to-r from-amber-100 to-orange-100 px-3 sm:px-4 py-2 rounded-lg border border-amber-300">
                  <p className="text-xs sm:text-sm font-semibold text-amber-900 text-center">
                    بالليرة التركية: <span className="text-sm sm:text-base">{totalCostPriceInTL.toFixed(2)} TL</span>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Expenses</p>
              <Badge variant="destructive" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalExpenses.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <p className="text-xs sm:text-sm font-medium text-slate-600">Total Paraniz Sales Amount</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalParanizSales.toFixed(2)}
              </Badge>
            </div>
          </div>
          
          {/* Net Total Calculation */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-200">
            <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-300 shadow-lg">
              <p className="text-sm sm:text-base font-semibold text-slate-700 mb-2">Net Total</p>
              <p className="text-xs text-slate-600 mb-3 sm:mb-4">
                (Total Selling Price + Total Paraniz Sales Amount)
              </p>
              <Badge variant="default" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
                {netTotal.toFixed(2)}
              </Badge>
            </div>
            
            {/* Total Cost Price in TL Display */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-200">
              <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-purple-300 shadow-lg">
                <p className="text-sm sm:text-base font-semibold text-slate-700 mb-2">Total Cost Price (Turkish TL)</p>
                <p className="text-xs text-slate-600 mb-3 sm:mb-4">
                  (Total Cost Price in Dollar × Dollar to TL Rate)
                </p>
                <Badge variant="default" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
                  {totalCostPriceInTL.toFixed(2)} TL
                </Badge>
              </div>
            </div>
            
            {/* Net Total with Cash and Expenses */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-slate-200">
              <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-300 shadow-lg">
                <p className="text-sm sm:text-base font-semibold text-slate-700 mb-2">
                  Net Total with Cash and Expenses
                </p>
                <p className="text-xs text-slate-600 mb-3 sm:mb-4">
                  (Net Total + Cash In Box Yesterday - Total Expenses)
                </p>
                <Badge variant="default" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold">
                  {netTotalWithCashAndExpenses.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash In Box Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cash In Box</CardTitle>
        </CardHeader>
        <CardContent>
          {cashLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading cash data..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashInBoxYesterday">Cash In Box Yesterday</Label>
                <Input
                  id="cashInBoxYesterday"
                  type="number"
                  step="0.01"
                  value={cashInBoxYesterday}
                  onChange={(e) =>
                    setCashInBoxYesterday(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashInBoxToday">Cash In Box Today</Label>
                <Input
                  id="cashInBoxToday"
                  type="number"
                  step="0.01"
                  value={cashInBoxToday}
                  onChange={(e) =>
                    setCashInBoxToday(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button onClick={handleCashSave}>Save Cash Data</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Difference Result */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 border-2 border-slate-300 shadow-lg">
            <p className="text-sm sm:text-base font-semibold text-slate-700 mb-2">
              الفرق النقدي (Cash Difference)
            </p>
            <p className="text-xs text-slate-600 mb-3 sm:mb-4">
              (Cash In Box Today - Net Total with Cash and Expenses)
            </p>
            <Badge 
              variant="default" 
              className={`text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center font-bold ${
                cashDifference === 0 
                  ? "bg-gradient-to-r from-gray-500 to-slate-600 text-white" 
                  : cashDifference > 0 
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                  : "bg-gradient-to-r from-red-600 to-rose-600 text-white"
              }`}
            >
              {formattedCashDifference}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

