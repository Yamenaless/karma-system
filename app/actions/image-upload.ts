"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function uploadProductImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createServerClient()
    
    const file = formData.get('file') as File
    const productCode = formData.get('productCode') as string || 'product'
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${productCode}-${Date.now()}.${fileExt}`
    const filePath = `products/${fileName}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload image" }
  }
}

export async function deleteProductImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerClient()
    
    // Extract file path from URL
    const urlParts = imageUrl.split('/')
    const filePath = urlParts.slice(urlParts.indexOf('product-images') + 1).join('/')

    if (!filePath) {
      return { success: false, error: "Invalid image URL" }
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete image" }
  }
}

