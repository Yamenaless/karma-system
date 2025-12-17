"use server"

import { createServerClient } from "@/lib/supabase/server"
import { KarmaProductFormData, ProductTypeFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

// Product Types Actions
export async function getAllProductTypes() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("products_types")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function addProductType(data: ProductTypeFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("products_types")
    .insert({
      name: data.name,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

export async function updateProductType(id: string, data: ProductTypeFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("products_types")
    .update({
      name: data.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

export async function deleteProductType(id: string) {
  const supabase = createServerClient()
  
  // Check if any products are using this type
  const { data: products, error: checkError } = await supabase
    .from("karma_products")
    .select("id")
    .eq("type_id", id)
    .limit(1)

  if (checkError) {
    return { success: false, error: checkError.message }
  }

  if (products && products.length > 0) {
    return { success: false, error: "Cannot delete product type that is in use by products" }
  }

  const { error } = await supabase
    .from("products_types")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

// Karma Products Actions
export async function getAllKarmaProducts() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("karma_products")
    .select(`
      *,
      type:products_types(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  // Map snake_case from database to camelCase for TypeScript
  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price.toString()),
    product_cost: parseFloat(item.product_cost.toString()),
    code: item.code,
    type_id: item.type_id,
    type: item.type ? {
      id: item.type.id,
      name: item.type.name,
      created_at: item.type.created_at,
      updated_at: item.type.updated_at,
    } : null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))

  return { success: true, data: mappedData }
}

export async function getKarmaProductById(id: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("karma_products")
    .select(`
      *,
      type:products_types(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  if (!data) {
    return { success: false, error: "Product not found", data: null }
  }

  const mappedData = {
    id: data.id,
    name: data.name,
    description: data.description,
    price: parseFloat(data.price.toString()),
    product_cost: parseFloat(data.product_cost.toString()),
    code: data.code,
    type_id: data.type_id,
    type: data.type ? {
      id: data.type.id,
      name: data.type.name,
      created_at: data.type.created_at,
      updated_at: data.type.updated_at,
    } : null,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }

  return { success: true, data: mappedData }
}

export async function addKarmaProduct(data: KarmaProductFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("karma_products")
    .insert({
      name: data.name,
      description: data.description || null,
      price: data.price,
      product_cost: data.product_cost,
      code: data.code,
      type_id: data.type_id,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

export async function updateKarmaProduct(id: string, data: KarmaProductFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("karma_products")
    .update({
      name: data.name,
      description: data.description || null,
      price: data.price,
      product_cost: data.product_cost,
      code: data.code,
      type_id: data.type_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

export async function deleteKarmaProduct(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("karma_products")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/karma-products")
  return { success: true }
}

