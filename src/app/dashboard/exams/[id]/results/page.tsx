import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'
import { redirect } from 'next/navigation'

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const quizId = (await params).id
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: quiz } = await supabase.from('quizzes').select('*, lessons(course_id)').eq('id', quizId).single()
  if (!quiz) return <div>Quiz not found.</div>

  const { data: submission } = await supabase
    .from('quiz_submissions')
    .select('*, student_answers(*, questions(*))')
    .eq('quiz_id', quizId)
    .eq('student_id', authData.user.id)
    .single()

  if (!submission) {
    redirect(`/dashboard/exams/${quizId}`)
  }

  const isRtl = quiz.language === 'ar'
  const answers = submission.student_answers

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/courses/${quiz.lessons.course_id}`} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium">
          <ArrowLeft size={20} />
          Back to Course
        </Link>
      </div>

      {/* Score Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-center p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title} - Results</h2>
        <p className="text-gray-500 mb-8">You have completed this exam.</p>

        <div className="inline-flex flex-col items-center justify-center w-48 h-48 rounded-full border-8 border-indigo-100 bg-indigo-50 relative">
          <svg className="absolute inset-0 w-full h-full text-indigo-500" viewBox="0 0 36 36">
            <path
              className="stroke-current"
              strokeWidth="3"
              strokeDasharray={`${submission.score}, 100`}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-4xl font-black text-indigo-700">{submission.score}%</span>
            <span className="text-sm font-medium text-indigo-500 uppercase tracking-wide">Score</span>
          </div>
        </div>
      </div>

      {/* detailed Review */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Detailed Review</h3>
        
        {answers.map((ans: any, i: number) => {
          const q = ans.questions
          return (
            <div key={ans.id} className={`p-6 border rounded-xl ${ans.is_correct ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
              <div className="flex gap-4">
                <div className="mt-1">
                  {ans.is_correct ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                </div>
                <div className="flex-1 space-y-4">
                  <div className="text-lg font-medium text-gray-900">
                    <Latex>{q.text}</Latex>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-gray-200 rounded-md">
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Your Answer</p>
                      <p className={`font-medium ${ans.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                        {ans.given_answer ? <Latex>{ans.given_answer}</Latex> : <span className="italic opacity-50">No answer provided</span>}
                      </p>
                    </div>
                    
                    {!ans.is_correct && (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                        <p className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wider">Correct Answer</p>
                        <p className="font-medium text-green-800">
                          <Latex>{q.correct_answer}</Latex>
                        </p>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-900">
                      <p className="font-semibold mb-1">Explanation:</p>
                      <Latex>{q.explanation}</Latex>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
