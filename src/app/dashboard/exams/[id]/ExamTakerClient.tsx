'use client'

import { useState } from 'react'
import { submitExamAction } from './actions'
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExamTakerClient({ quiz, questions, courseId }: any) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isRtl = quiz.language === 'ar'
  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  const handleOptionSelect = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }))
  }

  const handleTextChange = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await submitExamAction(quiz.id, courseId, answers)
      router.push(`/dashboard/exams/${quiz.id}/results`)
    } catch (err: any) {
      setError(err.message || "Failed to submit exam")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quiz.title}</h2>
          <p className="text-indigo-200 mt-1 capitalize">{quiz.type} • {quiz.difficulty}</p>
        </div>
        <div className="text-sm font-medium bg-indigo-500/50 px-3 py-1.5 rounded-md">
          Question {currentIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <div className="text-lg font-medium text-gray-900 leading-relaxed mb-6">
            <Latex>{currentQuestion.text}</Latex>
          </div>

          {currentQuestion.type === 'mcq' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((opt: string, i: number) => {
                const isSelected = answers[currentQuestion.id] === opt
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(currentQuestion.id, opt)}
                    className={`w-full text-${isRtl ? 'right' : 'left'} p-4 rounded-lg border-2 transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <Latex>{opt}</Latex>
                  </button>
                )
              })}
            </div>
          )}

          {currentQuestion.type !== 'mcq' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Answer:</label>
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                rows={4}
                placeholder="Type your final answer or solution steps here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
              ></textarea>
              <p className="text-xs text-gray-500">For step-by-step questions, type your final answer clearly.</p>
            </div>
          )}
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0 || isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2 bg-indigo-100 text-indigo-700 font-medium rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-2"
            >
              Next
              {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
