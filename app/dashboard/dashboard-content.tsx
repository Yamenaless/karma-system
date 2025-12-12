"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getTransformationTotalsByDate } from "@/app/actions/products"
import { getCashByDate, getPreviousDayCash, upsertCash } from "@/app/actions/cash"
import { getTotalExpensesByDate } from "@/app/actions/expenses"
import { getParanizSalesTotalByDate } from "@/app/actions/paraniz"
import { DollarSign } from "lucide-react"

export function DashboardContent() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

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
    const result = await getTotalExpensesByDate(date)
    if (result.success) {
      setTotalExpenses(result.total)
    }
  }

  const loadTransformationTotals = async () => {
    const result = await getTransformationTotalsByDate(date)
    if (result.success && result.totals) {
      setTransformationTotals(result.totals)
    }
  }

  const loadParanizSalesTotal = async () => {
    const result = await getParanizSalesTotalByDate(date)
    if (result.success) {
      setTotalParanizSales(result.total)
    }
  }

  useEffect(() => {
    loadCash()
    loadTotalExpenses()
    loadTransformationTotals()
    loadParanizSalesTotal()
  }, [date])


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

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Accounting System</h1>
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

      {/* Dollar to TL Rate Field */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <Label htmlFor="dollarToTLRate" className="text-base font-semibold text-slate-700 whitespace-nowrap">
              سعر صرف الدولار مقابل الليرة التركية (Dollar to TL Rate):
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
              <p className="text-sm font-medium text-slate-600">Total Selling Price</p>
              <Badge variant="default" className="text-xl px-5 py-3 w-full justify-center">
                {transformationTotals.totalSellingPrice.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 shadow-md">
              <p className="text-sm font-medium text-slate-700">Total Cost Price (Dollar)</p>
              <div className="flex items-center justify-center gap-2 bg-white/60 rounded-lg p-3 border border-amber-200">
                <DollarSign className="h-6 w-6 text-amber-600" />
                <Badge variant="outline" className="text-xl px-5 py-3 border-2 border-amber-400 bg-amber-50 text-amber-900 font-bold">
                  {transformationTotals.totalCostPriceInDollar.toFixed(2)}
                </Badge>
              </div>
              {dollarToTLRate > 0 && (
                <div className="mt-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-lg border border-amber-300">
                  <p className="text-sm font-semibold text-amber-900 text-center">
                    بالليرة التركية: <span className="text-base">{totalCostPriceInTL.toFixed(2)} TL</span>
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200">
              <p className="text-sm font-medium text-slate-600">Total Expenses</p>
              <Badge variant="destructive" className="text-xl px-5 py-3 w-full justify-center">
                {totalExpenses.toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <p className="text-sm font-medium text-slate-600">Total Paraniz Sales Amount</p>
              <Badge variant="default" className="text-xl px-5 py-3 w-full justify-center">
                {totalParanizSales.toFixed(2)}
              </Badge>
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
            <p>Loading cash data...</p>
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
    </div>
  )
}

