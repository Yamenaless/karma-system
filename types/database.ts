export interface DailyTransformation {
  id: string
  date: string
  name: string
  quantity: number
  dollarRate: number
  sellingPrice: number
  created_at: string
}

export interface DailyCash {
  id: string
  date: string
  cashInBoxYesterday: number
  cashInBoxToday: number
  dollarToTLRate: number
  created_at: string
}

export interface TransformationFormData {
  name: string
  quantity: number
  dollarRate: number
  sellingPrice: number
}

export interface DailyExpense {
  id: string
  date: string
  name: string
  amount: number
  created_at: string
}

export interface ExpenseFormData {
  name: string
  amount: number
}

export interface DailyParaniz {
  id: string
  date: string
  kontorAmount: number
  kontorCost: number
  faturaAmount: number
  faturaCost: number
  created_at: string
}

export interface ParanizFormData {
  kontorAmount: number
  kontorCost: number
  faturaAmount: number
  faturaCost: number
}

export interface DailyParanizSale {
  id: string
  date: string
  name: string
  amount: number
  cost: number
  category: "FATURA" | "KONTOR"
  subscriptionNumber: string
  created_at: string
}

export interface ParanizSaleFormData {
  name: string
  amount: number
  cost: number
  category: "FATURA" | "KONTOR"
  subscriptionNumber: string
}

