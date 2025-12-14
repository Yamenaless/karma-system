"use server"

import { createServerClient } from "@/lib/supabase/server"
import { DebtFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function addDebt(date: string, data: DebtFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("debts")
    .insert({
      date,
      customer_name: data.customer_name,
      product_name: data.product_name,
      product_cost: data.product_cost,
      amount: data.amount,
      is_paid: false, // Default value is not paid
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function getDebtsByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("date", date)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getAllDebts() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getUnpaidDebts() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("debts")
    .select("*")
    .eq("is_paid", false)
    .order("date", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function updateDebt(id: string, data: DebtFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("debts")
    .update({
      customer_name: data.customer_name,
      product_name: data.product_name,
      product_cost: data.product_cost,
      amount: data.amount,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleDebtPaidStatus(id: string, isPaid: boolean) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("debts")
    .update({
      is_paid: isPaid,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteDebt(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("debts")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/debts")
  revalidatePath("/dashboard")
  return { success: true }
}

