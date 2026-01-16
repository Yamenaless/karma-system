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
  
  const [fromDate, setFromDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })
  
  const [toDate, setToDate] = useState(() => {
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
    
    // Determine which date to use for cash loading
    const cashDate = dateFilter === "dateRange" ? toDate : date
    
    // Load previous day's cashInBoxToday
    const prevCashResult = await getPreviousDayCash(cashDate)
    if (prevCashResult.success) {
      setCashInBoxYesterday(prevCashResult.data || 0)
    }

    // Load today's cash data
    const cashResult = await getCashByDate(cashDate)
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
    } else if (dateFilter === "dateRange") {
      result = await getTotalExpensesByDateRange(fromDate, toDate)
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
    } else if (dateFilter === "dateRange") {
      result = await getTransformationTotalsByDateRange(fromDate, toDate)
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
    } else if (dateFilter === "dateRange") {
      result = await getParanizSalesTotalByDateRange(fromDate, toDate)
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
  }, [date, fromDate, toDate, dateFilter])


  const handleCashSave = async () => {
    const cashDate = dateFilter === "dateRange" ? toDate : date
    const result = await upsertCash(cashDate, cashInBoxYesterday, cashInBoxToday, dollarToTLRate)
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
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daily Accounting System</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            {dateFilter === "custom" ? (
              <>Date: <span className="font-semibold text-black">{date}</span></>
            ) : dateFilter === "dateRange" ? (
              <>Date Range: <span className="font-semibold text-black">{fromDate} to {toDate}</span></>
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
                <DialogHeader className="pb-4 border-b border-gray-200">
                  <DialogTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 border border-destructive/30">
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <div className="text-gray-900">Unpaid Debts Reminder</div>
                      <div className="text-sm font-normal text-gray-500 mt-1">
                        {unpaidDebts.length} unpaid debt{unpaidDebts.length > 1 ? "s" : ""} require attention
                      </div>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto space-y-4 py-4">
                  {/* Summary Alert */}
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Total Unpaid Amount</p>
                        <p className="text-2xl font-bold text-destructive">
                          {totalUnpaidAmount.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant="destructive" className="text-sm px-3 py-1.5">
                        {unpaidDebts.length} Item{unpaidDebts.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  {/* Debts Table */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-base flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive"></span>
                      Unpaid Debts List
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
                      <table className="w-full border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left p-3 font-semibold text-gray-700 text-sm">Date</th>
                            <th className="text-left p-3 font-semibold text-gray-700 text-sm">Customer</th>
                            <th className="text-left p-3 font-semibold text-gray-700 text-sm">Product</th>
                            <th className="text-right p-3 font-semibold text-gray-700 text-sm">Cost ($)</th>
                            <th className="text-right p-3 font-semibold text-gray-700 text-sm">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unpaidDebts.map((debt, index) => (
                            <tr 
                              key={debt.id} 
                              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              }`}
                            >
                              <td className="p-3 text-sm text-gray-600 font-medium">{debt.date}</td>
                              <td className="p-3 text-sm font-semibold text-gray-900">{debt.customer_name}</td>
                              <td className="p-3 text-sm text-gray-700">{debt.product_name}</td>
                              <td className="text-right p-3 text-sm text-gray-700 font-medium">${(debt.product_cost || 0).toFixed(2)}</td>
                              <td className="text-right p-3 text-sm font-bold text-destructive">{debt.amount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Calculation Box at Bottom */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Total Costs (Dollar)</p>
                        <DollarSign className="h-4 w-4 text-warning" />
                      </div>
                      <p className="text-xl font-bold text-gray-900">${totalUnpaidCosts.toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Total Amount</p>
                        <span className="text-destructive text-lg">💰</span>
                      </div>
                      <p className="text-xl font-bold text-destructive">{totalUnpaidAmount.toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-600">Total Items</p>
                        <span className="text-primary text-lg">📊</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900">{unpaidDebts.length}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 mt-4 border-t border-gray-200">
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
          </div>
        </div>
      </div>

      {/* Dollar to TL Rate Field */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
            <Label htmlFor="dollarToTLRate" className="text-sm sm:text-base font-semibold text-black">
              Dollar to TL Rate:
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
              Save Exchange Rate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm">💰</span>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Total Selling Price</p>
              <p className="text-2xl font-bold text-gray-900">{transformationTotals.totalSellingPrice.toFixed(2)}</p>
            </div>
            <div className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Total Cost Price (Dollar)</p>
              <p className="text-2xl font-bold text-gray-900">${transformationTotals.totalCostPriceInDollar.toFixed(2)}</p>
              {dollarToTLRate > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {totalCostPriceInTL.toFixed(2)} TL
                </p>
              )}
            </div>
            <div className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-sm">📉</span>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="relative p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4">
                <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <span className="text-info text-sm">📊</span>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">Total Paraniz Sales</p>
              <p className="text-2xl font-bold text-gray-900">{totalParanizSales.toFixed(2)}</p>
            </div>
          </div>
          
          {/* Net Total Calculation */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-lg border border-gray-200 bg-white">
                <p className="text-sm font-medium text-gray-600 mb-1">Net Total</p>
                <p className="text-xs text-gray-500 mb-3">(Selling Price + Paraniz Sales)</p>
                <p className="text-2xl font-bold text-gray-900">{netTotal.toFixed(2)}</p>
              </div>
              
              <div className="p-5 rounded-lg border border-gray-200 bg-white">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Cost Price (TL)</p>
                <p className="text-xs text-gray-500 mb-3">(Cost × Dollar Rate)</p>
                <p className="text-2xl font-bold text-gray-900">{totalCostPriceInTL.toFixed(2)} TL</p>
              </div>
              
              <div className="p-5 rounded-lg border border-gray-200 bg-white">
                <p className="text-sm font-medium text-gray-600 mb-1">Net with Cash & Expenses</p>
                <p className="text-xs text-gray-500 mb-3">(Net + Yesterday - Expenses)</p>
                <p className="text-2xl font-bold text-gray-900">{netTotalWithCashAndExpenses.toFixed(2)}</p>
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
        <CardContent className="mt-4">
          {cashLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" text="Loading cash data..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cashInBoxYesterday" className="text-sm font-medium text-gray-700">Cash In Box Yesterday</Label>
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
                <Label htmlFor="cashInBoxToday" className="text-sm font-medium text-gray-700">Cash In Box Today</Label>
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
                <Button onClick={handleCashSave} className="w-full sm:w-auto">Save Cash Data</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Difference Result */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          <div className="p-5 rounded-lg border border-gray-200 bg-white">
            <p className="text-sm font-medium text-gray-600 mb-1">
              Cash Difference
            </p>
            <p className="text-xs text-gray-500 mb-3">
              (Cash In Box Today - Net Total with Cash and Expenses)
            </p>
            <p className={`text-2xl font-bold ${
              cashDifference === 0 
                ? "text-gray-600" 
                : cashDifference > 0 
                ? "text-success" 
                : "text-destructive"
            }`}>
              {formattedCashDifference}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

