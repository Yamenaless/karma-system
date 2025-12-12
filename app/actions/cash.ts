"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCashByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_cash")
    .select("*")
    .eq("date", date)
    .single()

  if (error && error.code !== "PGRST116") {
    return { success: false, error: error.message, data: null }
  }

  // Map snake_case from database to camelCase for TypeScript
  if (data) {
    return {
      success: true,
      data: {
        id: data.id,
        date: data.date,
        cashInBoxYesterday: data.cash_in_box_yesterday,
        cashInBoxToday: data.cash_in_box_today,
        dollarToTLRate: data.dollar_to_tl_rate || 0,
        created_at: data.created_at,
      },
    }
  }

  return { success: true, data: null }
}

export async function getPreviousDayCash(date: string) {
  const supabase = createServerClient()
  
  // Get previous day
  const prevDate = new Date(date)
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = prevDate.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("daily_cash")
    .select("cash_in_box_today")
    .eq("date", prevDateStr)
    .single()

  if (error && error.code !== "PGRST116") {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data?.cash_in_box_today || 0 }
}

export async function upsertCash(
  date: string,
  cashInBoxYesterday: number,
  cashInBoxToday: number,
  dollarToTLRate: number
) {
  const supabase = createServerClient()
  
  // Map camelCase to snake_case to match database schema
  const { error } = await supabase
    .from("daily_cash")
    .upsert({
      date,
      cash_in_box_yesterday: cashInBoxYesterday,
      cash_in_box_today: cashInBoxToday,
      dollar_to_tl_rate: dollarToTLRate,
    }, {
      onConflict: "date"
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

