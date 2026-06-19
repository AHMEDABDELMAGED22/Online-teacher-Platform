'use server'

import { createClient } from '@/utils/supabase/server'
import { generateMathematicsExam, ExamSchema, GeneratedExam } from '@/lib/ai/groq'

export async function generateExamAction(formData: FormData): Promise<{ success: boolean, exam?: GeneratedExam, error?: string }> {
  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) throw new Error("Unauthorized")

    const topicsRaw = formData.get('topics') as string
    const topics = topicsRaw ? topicsRaw.split(',').map(t => t.trim()) : ['General Mathematics']
    
    const language = formData.get('language') as 'ar' | 'en' | 'mixed'
    const type = formData.get('type') as string
    const difficulty = formData.get('difficulty') as 'easy' | 'medium' | 'hard'
    const distribution = formData.get('distribution') as string

    // Generate Exam via Groq
    const exam = await generateMathematicsExam({
      topics,
      language,
      type,
      difficulty,
      questionDistribution: distribution
    })

    // Log to history
    await supabase.from('ai_generation_history').insert([{
      admin_id: authData.user.id,
      prompt_used: `Generated ${type} exam. Difficulty: ${difficulty}. Distribution: ${distribution}. Topics: ${topics.join(', ')}`,
      output_json: exam
    }])

    return { success: true, exam }
  } catch (error: any) {
    console.error("Action error:", error)
    return { success: false, error: error.message || "Failed to generate exam." }
  }
}

export async function publishExamAction(exam: GeneratedExam, lessonId: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) throw new Error("Unauthorized")

  // Insert Quiz
  const { data: quiz, error: quizError } = await supabase.from('quizzes').insert([{
    lesson_id: lessonId,
    title: exam.title,
    language: exam.language,
    type: exam.questions[0]?.type || 'practice', // default to first q type or practice
    difficulty: exam.difficulty,
    is_published: true
  }]).select().single()

  if (quizError || !quiz) throw new Error("Failed to save quiz")

  // Insert Questions
  const questionsToInsert = exam.questions.map(q => ({
    quiz_id: quiz.id,
    type: q.type,
    text: q.text,
    options: q.options || null,
    correct_answer: q.correctAnswer,
    explanation: q.explanation,
    topic: q.topic
  }))

  const { error: qError } = await supabase.from('questions').insert(questionsToInsert)
  if (qError) throw new Error("Failed to save questions")

  return { success: true, quizId: quiz.id }
}
