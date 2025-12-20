"use server"

import { createServerClient } from "@/lib/supabase/server"
import { ProductFormData } from "@/types/database"
import { revalidatePath } from "next/cache"

// Categories Actions
export async function getAllCategories() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

// Company Brands Actions
export async function getAllCompanyBrands() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("company_brands")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

// Subcategories Actions
export async function getSubcategoriesByCategory(categoryId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getAllSubcategories() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("subcategories")
    .select(`
      *,
      category:categories(*)
    `)
    .order("name", { ascending: true })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

// Products Actions
export async function getAllProducts() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("inventory_products")
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*),
      company_brand:company_brands(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  const mappedData = (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    code: item.code,
    quantity: parseFloat(item.quantity?.toString() || "0"),
    product_cost: parseFloat(item.product_cost?.toString() || "0"),
    price: parseFloat(item.price?.toString() || "0"),
    image: item.image,
    company_brand_id: item.company_brand_id,
    category_id: item.category_id,
    subcategory_id: item.subcategory_id,
    category: item.category ? {
      id: item.category.id,
      name: item.category.name,
      created_at: item.category.created_at,
      updated_at: item.category.updated_at,
    } : undefined,
    subcategory: item.subcategory ? {
      id: item.subcategory.id,
      name: item.subcategory.name,
      category_id: item.subcategory.category_id,
      created_at: item.subcategory.created_at,
      updated_at: item.subcategory.updated_at,
    } : undefined,
    company_brand: item.company_brand ? {
      id: item.company_brand.id,
      name: item.company_brand.name,
      created_at: item.company_brand.created_at,
      updated_at: item.company_brand.updated_at,
    } : undefined,
    created_at: item.created_at,
    updated_at: item.updated_at,
  }))

  return { success: true, data: mappedData }
}

export async function getProductById(id: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("inventory_products")
    .select(`
      *,
      category:categories(*),
      subcategory:subcategories(*),
      company_brand:company_brands(*)
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
    code: data.code,
    quantity: parseFloat(data.quantity?.toString() || "0"),
    product_cost: parseFloat(data.product_cost?.toString() || "0"),
    price: parseFloat(data.price?.toString() || "0"),
    image: data.image,
    company_brand_id: data.company_brand_id,
    category_id: data.category_id,
      subcategory_id: data.subcategory_id,
    category: data.category ? {
      id: data.category.id,
      name: data.category.name,
      created_at: data.category.created_at,
      updated_at: data.category.updated_at,
    } : undefined,
    subcategory: data.subcategory ? {
      id: data.subcategory.id,
      name: data.subcategory.name,
      category_id: data.subcategory.category_id,
      created_at: data.subcategory.created_at,
      updated_at: data.subcategory.updated_at,
    } : undefined,
    company_brand: data.company_brand ? {
      id: data.company_brand.id,
      name: data.company_brand.name,
      created_at: data.company_brand.created_at,
      updated_at: data.company_brand.updated_at,
    } : undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  }

  return { success: true, data: mappedData }
}

export async function addProduct(data: ProductFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("inventory_products")
    .insert({
      name: data.name,
      description: data.description || null,
      code: data.code,
      quantity: data.quantity,
      product_cost: data.product_cost,
      price: data.price,
      image: data.image || null,
      company_brand_id: data.company_brand_id || null,
      category_id: data.category_id || null,
      subcategory_id: data.subcategory_id || null,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function updateProduct(id: string, data: ProductFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("inventory_products")
    .update({
      name: data.name,
      description: data.description || null,
      code: data.code,
      quantity: data.quantity,
      product_cost: data.product_cost,
      price: data.price,
      image: data.image || null,
      company_brand_id: data.company_brand_id || null,
      category_id: data.category_id || null,
      subcategory_id: data.subcategory_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("inventory_products")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/products")
  return { success: true }
}
