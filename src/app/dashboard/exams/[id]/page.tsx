import { createClient } from '@/utils/supabase/server'
import ExamTakerClient from './ExamTakerClient'
import { redirect } from 'next/navigation'

export default async function StudentExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const quizId = (await params).id
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, lessons(course_id)')
    .eq('id', quizId)
    .eq('is_published', true)
    .single()

  if (!quiz) return <div>Exam not found or unavailable.</div>

  // Verify enrollment
  const courseId = quiz.lessons.course_id
  const { data: enrollment } = await supabase.from('enrollments').select('*').eq('course_id', courseId).eq('student_id', authData.user.id).single()
  if (!enrollment) redirect('/dashboard')

  // Check if already submitted
  const { data: previousSubmission } = await supabase.from('quiz_submissions').select('id').eq('quiz_id', quizId).eq('student_id', authData.user.id).single()
  if (previousSubmission) {
    redirect(`/dashboard/exams/${quizId}/results`)
  }

  // Fetch questions
  const { data: questions } = await supabase.from('questions').select('id, type, text, options').eq('quiz_id', quizId)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ExamTakerClient quiz={quiz} questions={questions || []} courseId={courseId} />
    </div>
  )
}
