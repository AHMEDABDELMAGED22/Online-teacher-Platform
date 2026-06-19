'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createLesson(formData: FormData) {
  const supabase = await createClient()
  
  const courseId = formData.get('courseId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const youtube_url = formData.get('youtube_url') as string
  const topicsRaw = formData.get('topics') as string
  const is_published = formData.get('is_published') === 'on'

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) throw new Error("Unauthorized")

  // Insert Lesson
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .insert([
      { 
        course_id: courseId, 
        title, 
        description, 
        youtube_url, 
        is_published,
        created_by: authData.user.id 
      }
    ])
    .select()
    .single()

  if (lessonError || !lesson) {
    console.error("Error creating lesson:", lessonError)
    redirect(`/admin/courses/${courseId}/lessons/new?error=Failed to create lesson`)
  }

  // Insert Topics if any
  if (topicsRaw) {
    const topics = topicsRaw.split(',').map(t => t.trim()).filter(Boolean)
    if (topics.length > 0) {
      const topicsData = topics.map(name => ({
        lesson_id: lesson.id,
        name
      }))
      await supabase.from('lesson_topics').insert(topicsData)
    }
  }

  revalidatePath(`/admin/courses/${courseId}`)
  redirect(`/admin/courses/${courseId}`)
}
