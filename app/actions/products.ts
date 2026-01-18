"use server"

import { createServerClient } from "@/lib/supabase/server"
import { TransformationFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

export async function addTransformation(date: string, data: TransformationFormData) {
  const supabase = createServerClient()
  
  // Map camelCase to snake_case to match database schema
  const { error } = await supabase
    .from("daily_transformations")
    .insert({
      date,
      product_name: data.name,
      quantity: data.quantity,
      product_cost: data.productCost,
      selling_price: data.sellingPrice,
      is_net_profit: data.isNetProfit || false,
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
  
  // Ensure date is in YYYY-MM-DD format
  const formattedDate = date.split('T')[0]
  
  const { data, error } = await supabase
    .from("daily_transformations")
    .select("*")
    .eq("date", formattedDate)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database error:", error)
    // Provide more helpful error message for missing table
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      return { 
        success: false, 
        error: "Table 'daily_transformations' not found. Please run the migration script in Supabase SQL Editor. See check-and-create-table.sql file.", 
        data: [] 
      }
    }
    return { success: false, error: error.message, data: [] }
  }

  // Ensure we always return an array
  if (!data) {
    return { success: true, data: [] }
  }

  // Map snake_case from database to camelCase for TypeScript
  const mappedData = data.map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.product_name,
    quantity: parseFloat(item.quantity?.toString() || "0"),
    productCost: parseFloat(item.product_cost?.toString() || "0"),
    sellingPrice: parseFloat(item.selling_price?.toString() || "0"),
    isNetProfit: item.is_net_profit || false,
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function updateTransformation(id: string, data: TransformationFormData) {
  const supabase = createServerClient()
  
  // Map camelCase to snake_case to match database schema
  const { error } = await supabase
    .from("daily_transformations")
    .update({
      product_name: data.name,
      quantity: data.quantity,
      product_cost: data.productCost,
      selling_price: data.sellingPrice,
      is_net_profit: data.isNetProfit || false,
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
    .from("daily_transformations")
    .select("selling_price, product_cost, quantity")
    .eq("date", date)

  if (error) {
    return { success: false, error: error.message, totals: null }
  }

  // DO NOT round during accumulation - only round final result for display
  // This ensures accurate calculations for decimal numbers like 0.85
  const totals = (data || []).reduce(
    (acc, item) => {
      const sellingPrice = Number(item.selling_price || 0)
      const productCost = Number(item.product_cost || 0)
      const quantity = Number(item.quantity || 0)
      const costPrice = productCost * quantity
      
      return {
        totalSellingPrice: acc.totalSellingPrice + sellingPrice,
        totalCostPriceInDollar: acc.totalCostPriceInDollar + costPrice,
      }
    },
    {
      totalSellingPrice: 0,
      totalCostPriceInDollar: 0,
    }
  )

  return { success: true, totals }
}

export async function getTransformationsByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const formattedStartDate = startDate.split('T')[0]
  const formattedEndDate = endDate.split('T')[0]
  
  const { data, error } = await supabase
    .from("daily_transformations")
    .select("*")
    .gte("date", formattedStartDate)
    .lte("date", formattedEndDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database error:", error)
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      return { 
        success: false, 
        error: "Table 'daily_transformations' not found. Please run the migration script in Supabase SQL Editor. See check-and-create-table.sql file.", 
        data: [] 
      }
    }
    return { success: false, error: error.message, data: [] }
  }

  if (!data) {
    return { success: true, data: [] }
  }

  const mappedData = data.map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.product_name,
    quantity: parseFloat(item.quantity?.toString() || "0"),
    productCost: parseFloat(item.product_cost?.toString() || "0"),
    sellingPrice: parseFloat(item.selling_price?.toString() || "0"),
    isNetProfit: item.is_net_profit || false,
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

export async function getTransformationTotalsByDateRange(startDate: string, endDate: string) {
  const supabase = createServerClient()
  
  const formattedStartDate = startDate.split('T')[0]
  const formattedEndDate = endDate.split('T')[0]
  
  const { data, error } = await supabase
    .from("daily_transformations")
    .select("selling_price, product_cost, quantity")
    .gte("date", formattedStartDate)
    .lte("date", formattedEndDate)

  if (error) {
    return { success: false, error: error.message, totals: null }
  }

  // DO NOT round during accumulation - only round final result for display
  // This ensures accurate calculations for decimal numbers like 0.85
  const totals = (data || []).reduce(
    (acc, item) => {
      const sellingPrice = Number(item.selling_price || 0)
      const productCost = Number(item.product_cost || 0)
      const quantity = Number(item.quantity || 0)
      const costPrice = productCost * quantity
      
      return {
        totalSellingPrice: acc.totalSellingPrice + sellingPrice,
        totalCostPriceInDollar: acc.totalCostPriceInDollar + costPrice,
      }
    },
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
    .from("daily_transformations")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/transformations")
  return { success: true }
}

export async function getAllTransformations() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("daily_transformations")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Database error:", error)
    if (error.message.includes("schema cache") || error.message.includes("does not exist")) {
      return { 
        success: false, 
        error: "Table 'daily_transformations' not found. Please run the migration script in Supabase SQL Editor. See check-and-create-table.sql file.", 
        data: [] 
      }
    }
    return { success: false, error: error.message, data: [] }
  }

  if (!data) {
    return { success: true, data: [] }
  }

  const mappedData = data.map((item: any) => ({
    id: item.id,
    date: item.date,
    name: item.product_name,
    quantity: parseFloat(item.quantity?.toString() || "0"),
    productCost: parseFloat(item.product_cost?.toString() || "0"),
    sellingPrice: parseFloat(item.selling_price?.toString() || "0"),
    isNetProfit: item.is_net_profit || false,
    created_at: item.created_at,
  }))

  return { success: true, data: mappedData }
}

