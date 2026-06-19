'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCourse(formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from('courses')
    .insert([
      { title, description, created_by: authData.user.id }
    ])
    .select()
    .single()

  if (error) {
    console.error("Error creating course:", error)
    redirect('/admin/courses/new?error=Failed to create course')
  }

  revalidatePath('/admin/courses')
  redirect(`/admin/courses/${data.id}`)
}
