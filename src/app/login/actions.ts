'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  // After successful login, redirect to student dashboard
  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}

export async function adminLogin(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/admin/login?error=Invalid credentials')
  }

  // Check if admin
  const { data: userAuth } = await supabase.auth.getUser()
  if (userAuth.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userAuth.user.id)
      .single()
      
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      redirect('/admin/login?error=Unauthorized')
    }
  }

  revalidatePath('/admin', 'layout')
  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
