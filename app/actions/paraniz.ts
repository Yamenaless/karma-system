"use server"

import { createServerClient } from "@/lib/supabase/server"
import { ParanizFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function addParaniz(date: string, data: ParanizFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz")
    .insert({
      date,
      kontor_amount: data.kontorAmount,
      kontor_cost: data.kontorCost,
      fatura_amount: data.faturaAmount,
      fatura_cost: data.faturaCost,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getParanizByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  // Map snake_case from database to camelCase for TypeScript
  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    date: item.date,
    kontorAmount: item.kontor_amount,
    kontorCost: item.kontor_cost,
    faturaAmount: item.fatura_amount,
    faturaCost: item.fatura_cost,
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function getParanizTotalsByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz")
    .select("kontor_amount, kontor_cost, fatura_amount, fatura_cost")
    .eq("date", date)

  if (error) {
    return { success: false, error: error.message, totals: null }
  }

  const totals = (data || []).reduce(
    (acc, item) => ({
      totalKontorAmount: acc.totalKontorAmount + (parseFloat(item.kontor_amount.toString()) || 0),
      totalKontorCost: acc.totalKontorCost + (parseFloat(item.kontor_cost.toString()) || 0),
      totalFaturaAmount: acc.totalFaturaAmount + (parseFloat(item.fatura_amount.toString()) || 0),
      totalFaturaCost: acc.totalFaturaCost + (parseFloat(item.fatura_cost.toString()) || 0),
    }),
    {
      totalKontorAmount: 0,
      totalKontorCost: 0,
      totalFaturaAmount: 0,
      totalFaturaCost: 0,
    }
  )

  return { success: true, totals }
}

export async function updateParaniz(id: string, data: ParanizFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz")
    .update({
      kontor_amount: data.kontorAmount,
      kontor_cost: data.kontorCost,
      fatura_amount: data.faturaAmount,
      fatura_cost: data.faturaCost,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteParaniz(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

// Paraniz Sales Actions
export async function addParanizSale(date: string, name: string, amount: number, cost: number, category: string, subscriptionNumber: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz_sales")
    .insert({
      date,
      name,
      amount,
      cost,
      category,
      subscription_number: subscriptionNumber,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getParanizSalesByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz_sales")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  // Map snake_case from database to camelCase for TypeScript
  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.name,
    amount: item.amount,
    cost: item.cost || 0,
    category: item.category || "FATURA",
    subscriptionNumber: item.subscription_number || "",
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function getParanizSalesTotalByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz_sales")
    .select("amount")
    .eq("date", date)

  if (error) {
    return { success: false, error: error.message, total: 0 }
  }

  const total = (data || []).reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0)
  return { success: true, total }
}

export async function getParanizSalesByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz_sales")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.name,
    amount: item.amount,
    cost: item.cost || 0,
    category: item.category || "FATURA",
    subscriptionNumber: item.subscription_number || "",
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function getAllParanizSales() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz_sales")
    .select("*")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.name,
    amount: item.amount,
    cost: item.cost || 0,
    category: item.category || "FATURA",
    subscriptionNumber: item.subscription_number || "",
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function getParanizSalesTotalByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_paraniz_sales")
    .select("amount")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    return { success: false, error: error.message, total: 0 }
  }

  const total = (data || []).reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0)
  return { success: true, total }
}

export async function updateParanizSale(id: string, name: string, amount: number, cost: number, category: string, subscriptionNumber: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz_sales")
    .update({
      name,
      amount,
      cost,
      category,
      subscription_number: subscriptionNumber,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteParanizSale(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_paraniz_sales")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/paraniz")
  revalidatePath("/dashboard")
  return { success: true }
}

