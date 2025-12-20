"use server"

import { createServerClient } from "@/lib/supabase/server"
import { ExpenseFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function addExpense(date: string, data: ExpenseFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_expenses")
    .insert({
      date,
      name: data.name,
      amount: data.amount,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getExpensesByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_expenses")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getTotalExpensesByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_expenses")
    .select("amount")
    .eq("date", date)

  if (error) {
    return { success: false, error: error.message, total: 0 }
  }

  const total = (data || []).reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0)
  return { success: true, total }
}

export async function getExpensesByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_expenses")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getTotalExpensesByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_expenses")
    .select("amount")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) {
    return { success: false, error: error.message, total: 0 }
  }

  const total = (data || []).reduce((sum, item) => sum + (parseFloat(item.amount.toString()) || 0), 0)
  return { success: true, total }
}

export async function updateExpense(id: string, data: ExpenseFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_expenses")
    .update({
      name: data.name,
      amount: data.amount,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_expenses")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

