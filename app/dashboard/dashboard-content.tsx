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
  const totalUnpaidCosts = unpaidDebts.reduce((sum, debt) => sum + (debt.product_cost || 0), 0)

  return (
    <div className="container mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Daily Accounting System</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {dateFilter === "custom" ? (
              <>Date: <span className="font-semibold text-black">{date}</span></>
            ) : (
              <>Period: <span className="font-semibold text-black">{getDateRangeByFilter(dateFilter).startDate} to {getDateRangeByFilter(dateFilter).endDate}</span></>
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
              <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col w-[95vw] sm:w-full">
                <DialogHeader className="pb-4 border-b-2 border-destructive/30">
                  <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20 border-2 border-destructive">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="text-destructive">Unpaid Debts Reminder</div>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        {unpaidDebts.length} unpaid debt{unpaidDebts.length > 1 ? "s" : ""} require attention
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                  {/* Summary Alert */}
                  <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/30 shadow-sm">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Total Unpaid Amount</p>
                        <p className="text-2xl font-bold text-destructive">
                          {totalUnpaidAmount.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        {unpaidDebts.length} Item{unpaidDebts.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  {/* Debts Table */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-black text-base sm:text-lg flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-destructive"></span>
                      Unpaid Debts List
                    </h3>
                    <div className="overflow-x-auto rounded-lg border-2 border-black">
                      <table className="w-full border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b-2 border-black bg-destructive/10">
                            <th className="text-left p-3 font-semibold text-black text-sm border-r border-black">Date</th>
                            <th className="text-left p-3 font-semibold text-black text-sm border-r border-black">Customer</th>
                            <th className="text-left p-3 font-semibold text-black text-sm border-r border-black">Product</th>
                            <th className="text-right p-3 font-semibold text-black text-sm border-r border-black">Cost ($)</th>
                            <th className="text-right p-3 font-semibold text-black text-sm">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unpaidDebts.map((debt, index) => (
                            <tr 
                              key={debt.id} 
                              className={`border-b border-black/20 hover:bg-destructive/5 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                              }`}
                            >
                              <td className="p-3 text-sm text-gray-700 border-r border-black/20 font-medium">{debt.date}</td>
                              <td className="p-3 text-sm font-semibold text-black border-r border-black/20">{debt.customer_name}</td>
                              <td className="p-3 text-sm text-gray-800 border-r border-black/20">{debt.product_name}</td>
                              <td className="text-right p-3 text-sm text-gray-800 border-r border-black/20 font-medium">${(debt.product_cost || 0).toFixed(2)}</td>
                              <td className="text-right p-3 text-sm font-bold text-destructive">{debt.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Calculation Box at Bottom */}
                <div className="mt-4 pt-4 border-t-2 border-black">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-warning/10 border-2 border-warning/30">
                      <p className="text-xs font-medium text-gray-700 mb-2">Total Costs (Dollar)</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-warning" />
                        <Badge variant="warning" className="text-lg font-bold px-3 py-2">
                          {totalUnpaidCosts.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
                      <p className="text-xs font-medium text-gray-700 mb-2">Total Amount</p>
                      <Badge variant="destructive" className="text-lg font-bold px-3 py-2">
                        {totalUnpaidAmount.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
                      <p className="text-xs font-medium text-gray-700 mb-2">Total Items</p>
                      <Badge variant="default" className="text-lg font-bold px-3 py-2">
                        {unpaidDebts.length}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 mt-4 border-t border-black/20">
                  <Button
                    variant="outline"
                    onClick={() => setReminderDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setReminderDialogOpen(false)
                      router.push("/debts")
                    }}
                    className="w-full sm:w-auto"
                  >
                    Go to Debts Page
                  </Button>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-warning/10 border-2 border-warning/30">
            <Label htmlFor="dollarToTLRate" className="text-sm sm:text-base font-semibold text-black">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Total Selling Price</p>
              <Badge variant="default" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {transformationTotals.totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-warning/10 border-2 border-warning/30 shadow-md">
              <p className="text-xs sm:text-sm font-medium text-black">Total Cost Price (Dollar)</p>
              <div className="flex items-center justify-center gap-2 bg-white rounded-lg p-2 sm:p-3 border border-warning/50">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-warning" />
                <Badge variant="warning" className="text-lg sm:text-xl px-3 sm:px-5 py-2 sm:py-3 font-bold">
                  {transformationTotals.totalCostPriceInDollar.toFixed(2)}
                </Badge>
              </div>
              {dollarToTLRate > 0 && (
                <div className="mt-2 bg-warning/20 px-3 sm:px-4 py-2 rounded-lg border border-warning/50">
                  <p className="text-xs sm:text-sm font-semibold text-black text-center">
                    بالليرة التركية: <span className="text-sm sm:text-base">{totalCostPriceInTL.toFixed(2)} TL</span>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-destructive/10 border-2 border-destructive/30">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Total Expenses</p>
              <Badge variant="destructive" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalExpenses.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-info/10 border-2 border-info/30">
              <p className="text-xs sm:text-sm font-medium text-gray-700">Total Paraniz Sales Amount</p>
              <Badge variant="info" className="text-lg sm:text-xl px-4 sm:px-5 py-2 sm:py-3 w-full justify-center">
                {totalParanizSales.toFixed(2)}
              </Badge>
            </div>
          </div>
          
          {/* Net Total Calculation */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black">
            <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-primary/10 border-2 border-primary/30 shadow-lg">
              <p className="text-sm sm:text-base font-semibold text-black mb-2">Net Total</p>
              <p className="text-xs text-gray-600 mb-3 sm:mb-4">
                (Total Selling Price + Total Paraniz Sales Amount)
              </p>
              <Badge variant="default" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center font-bold">
                {netTotal.toFixed(2)}
              </Badge>
            </div>
            
            {/* Total Cost Price in TL Display */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black">
              <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-warning/10 border-2 border-warning/30 shadow-lg">
                <p className="text-sm sm:text-base font-semibold text-black mb-2">Total Cost Price (Turkish TL)</p>
                <p className="text-xs text-gray-600 mb-3 sm:mb-4">
                  (Total Cost Price in Dollar × Dollar to TL Rate)
                </p>
                <Badge variant="warning" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center font-bold">
                  {totalCostPriceInTL.toFixed(2)} TL
                </Badge>
              </div>
            </div>
            
            {/* Net Total with Cash and Expenses */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t-2 border-black">
              <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-accent/10 border-2 border-accent/30 shadow-lg">
                <p className="text-sm sm:text-base font-semibold text-black mb-2">
                  Net Total with Cash and Expenses
                </p>
                <p className="text-xs text-gray-600 mb-3 sm:mb-4">
                  (Net Total + Cash In Box Yesterday - Total Expenses)
                </p>
                <Badge variant="default" className="text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center bg-accent text-accent-foreground font-bold">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 rounded-xl bg-gray-100 border-2 border-black shadow-lg">
            <p className="text-sm sm:text-base font-semibold text-black mb-2">
              الفرق النقدي (Cash Difference)
            </p>
            <p className="text-xs text-gray-600 mb-3 sm:mb-4">
              (Cash In Box Today - Net Total with Cash and Expenses)
            </p>
            <Badge 
              variant="default" 
              className={`text-xl sm:text-2xl px-4 sm:px-6 py-3 sm:py-4 w-full justify-center font-bold ${
                cashDifference === 0 
                  ? "bg-gray-500 text-white" 
                  : cashDifference > 0 
                  ? "bg-success text-success-foreground" 
                  : "bg-destructive text-destructive-foreground"
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

