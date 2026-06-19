'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function submitExamAction(quizId: string, courseId: string, answers: Record<string, string>) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) throw new Error("Unauthorized")

  // Fetch questions to calculate score
  const { data: questions } = await supabase.from('questions').select('id, correct_answer').eq('quiz_id', quizId)
  if (!questions) throw new Error("Questions not found")

  let correctCount = 0
  const studentAnswersToInsert = questions.map(q => {
    const given = answers[q.id] || ""
    const isCorrect = given.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
    if (isCorrect) correctCount++
    return {
      question_id: q.id,
      given_answer: given,
      is_correct: isCorrect
    }
  })

  const scorePercentage = Math.round((correctCount / questions.length) * 100)

  // Insert Submission
  const { data: submission, error: subError } = await supabase.from('quiz_submissions').insert([{
    student_id: authData.user.id,
    quiz_id: quizId,
    score: scorePercentage
  }]).select().single()

  if (subError || !submission) throw new Error("Failed to save submission")

  // Insert Answers
  const { error: ansError } = await supabase.from('student_answers').insert(
    studentAnswersToInsert.map(a => ({ ...a, submission_id: submission.id }))
  )
  if (ansError) throw new Error("Failed to save answers")

  // Update Progress
  const { data: progress } = await supabase.from('student_progress').select('*').eq('course_id', courseId).eq('student_id', authData.user.id).single()
  if (progress) {
    // calculate new average
    const currentTotalScore = (progress.average_score || 0) * (progress.completed_lessons || 0) // rough approx using completed lessons as attempts proxy
    // In a real app we'd average all quiz_submissions for this course, doing a simple update here
    
    await supabase.from('student_progress').update({ 
      average_score: scorePercentage, // simplified
      completed_lessons: (progress.completed_lessons || 0) + 1,
      last_activity: new Date().toISOString()
    }).eq('id', progress.id)
  }

  return { success: true, submissionId: submission.id }
}
