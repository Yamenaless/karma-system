"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface NoteFormData {
  title: string
  content: string
}

export interface Note {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export async function addNote(data: NoteFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("notes")
    .insert({
      title: data.title,
      content: data.content,
    })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/notes")
  return { success: true }
}

export async function getAllNotes() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data: data || [] }
}

export async function getNoteById(id: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, data }
}

export async function updateNote(id: string, data: NoteFormData) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("notes")
    .update({
      title: data.title,
      content: data.content,
    })
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/notes")
  return { success: true }
}

export async function deleteNote(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/notes")
  return { success: true }
}

