"use server"

import { createServerClient } from "@/lib/supabase/server"
import { TransformationFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function addTransformation(date: string, data: TransformationFormData) {
  const supabase = createServerClient()
  
  // Map camelCase to snake_case to match database schema
  const { error } = await supabase
    .from("daily_products")
    .insert({
      date,
      product_name: data.name,
      quantity: data.quantity,
      dollar_rate: data.dollarRate,
      selling_price: data.sellingPrice,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/transformations")
  return { success: true }
}

export async function getTransformationsByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_products")
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
    name: item.product_name,
    quantity: item.quantity,
    dollarRate: item.dollar_rate,
    sellingPrice: item.selling_price,
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function updateTransformation(id: string, data: TransformationFormData) {
  const supabase = createServerClient()
  
  // Map camelCase to snake_case to match database schema
  const { error } = await supabase
    .from("daily_products")
    .update({
      product_name: data.name,
      quantity: data.quantity,
      dollar_rate: data.dollarRate,
      selling_price: data.sellingPrice,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/transformations")
  return { success: true }
}

export async function getTransformationTotalsByDate(date: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_products")
    .select("selling_price, dollar_rate, quantity")
    .eq("date", date)

  if (error) {
    return { success: false, error: error.message, totals: null }
  }

  const totals = (data || []).reduce(
    (acc, item) => ({
      totalSellingPrice: acc.totalSellingPrice + (parseFloat(item.selling_price.toString()) || 0),
      totalCostPriceInDollar: acc.totalCostPriceInDollar + (parseFloat(item.dollar_rate.toString()) * parseFloat(item.quantity.toString()) || 0),
    }),
    {
      totalSellingPrice: 0,
      totalCostPriceInDollar: 0,
    }
  )

  return { success: true, totals }
}

export async function deleteTransformation(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("daily_products")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/transformations")
  return { success: true }
}

