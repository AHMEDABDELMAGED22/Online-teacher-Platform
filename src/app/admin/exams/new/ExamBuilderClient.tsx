'use client'

import { useState } from 'react'
import { generateExamAction, publishExamAction } from './actions'
import type { GeneratedExam } from '@/lib/ai/groq'
import 'katex/dist/katex.min.css'
import Latex from 'react-latex-next'
import { Loader2, Trash2, Edit2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ExamBuilderClient({ courses, lessons, lessonTopics }: any) {
  const router = useRouter()
  
  const [courseId, setCourseId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [exam, setExam] = useState<GeneratedExam | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)

  const availableLessons = lessons.filter((l: any) => l.course_id === courseId)
  
  const handleLessonChange = (id: string) => {
    setLessonId(id)
    const linkedTopics = lessonTopics.filter((t: any) => t.lesson_id === id).map((t: any) => t.name)
    setTopics(linkedTopics)
  }

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!lessonId) return setError("Please select a lesson first.")
    
    setIsGenerating(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    formData.append('topics', topics.join(',')) // Add the state topics
    
    const res = await generateExamAction(formData)
    
    if (res.success && res.exam) {
      setExam(res.exam)
    } else {
      setError(res.error || "Generation failed.")
    }
    
    setIsGenerating(false)
  }

  const handleDeleteQuestion = (id: string) => {
    if (!exam) return
    setExam({
      ...exam,
      questions: exam.questions.filter(q => q.id !== id)
    })
  }

  const handlePublish = async () => {
    if (!exam || !lessonId) return
    setIsPublishing(true)
    try {
      await publishExamAction(exam, lessonId)
      router.push('/admin/exams')
    } catch (err: any) {
      setError(err.message || "Failed to publish exam")
      setIsPublishing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Settings Panel */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Exam Configuration</h3>
        
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Select Course</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              <option value="">-- Choose Course --</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Select Lesson</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              value={lessonId}
              onChange={(e) => handleLessonChange(e.target.value)}
              required
              disabled={!courseId}
            >
              <option value="">-- Choose Lesson --</option>
              {availableLessons.map((l: any) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>

          {topics.length > 0 && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-md">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block mb-1">Topics Found</span>
              <div className="flex flex-wrap gap-1">
                {topics.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-800 text-xs rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <select name="language" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                <option value="ar">Arabic</option>
                <option value="en">English</option>
                <option value="mixed">Bilingual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Difficulty</label>
              <select name="difficulty" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Exam Type</label>
            <select name="type" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
              <option value="practice">Practice</option>
              <option value="homework">Homework</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final Exam</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Question Distribution</label>
            <textarea 
              name="distribution" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white resize-none" 
              rows={3} 
              required
              placeholder="e.g. 5 MCQ, 2 Solve Step-by-Step"
              defaultValue="5 MCQ, 2 Solve Step-by-Step"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={isGenerating || !lessonId}
            className="w-full py-2.5 bg-primary text-white font-medium rounded-md hover:bg-primary-hover disabled:bg-indigo-300 transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Generating AI Exam...</> : 'Generate Exam'}
          </button>
          
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>
      </div>

      {/* Preview Panel */}
      <div className="xl:col-span-2 space-y-6">
        {exam ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{exam.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase tracking-wider">{exam.language}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase tracking-wider">{exam.difficulty}</span>
                </div>
              </div>
              <button 
                onClick={handlePublish}
                disabled={isPublishing || exam.questions.length === 0}
                className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center gap-2"
              >
                {isPublishing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                Publish Exam
              </button>
            </div>

            <div className="space-y-8" dir={exam.language === 'ar' ? 'rtl' : 'ltr'}>
              {exam.questions.map((q, index) => (
                <div key={q.id} className="relative p-6 border border-gray-100 rounded-xl hover:border-primary/30 transition-colors group">
                  <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-gray-100 text-gray-600 hover:text-primary rounded-md" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <span className="text-xl font-bold text-primary">{index + 1}.</span>
                    <div className="flex-1 space-y-4">
                      <div className="text-lg font-medium text-gray-900">
                        <Latex>{q.text}</Latex>
                      </div>

                      {q.type === 'mcq' && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`p-3 rounded-md border ${opt === q.correctAnswer ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                              <Latex>{opt}</Latex>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-md">
                        <p className="text-sm font-semibold text-indigo-900 mb-1">Correct Answer:</p>
                        <p className="text-indigo-800"><Latex>{q.correctAnswer}</Latex></p>
                        
                        <div className="mt-3 pt-3 border-t border-indigo-200">
                          <p className="text-sm font-semibold text-indigo-900 mb-1">Explanation:</p>
                          <div className="text-indigo-800 text-sm">
                            <Latex>{q.explanation}</Latex>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{q.type.toUpperCase()}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">{q.topic}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {exam.questions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  All questions deleted.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <CheckCircle size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Exam Generated Yet</h3>
            <p className="max-w-sm">Configure the settings on the left and click "Generate Exam" to build a Mathematics test using AI.</p>
          </div>
        )}
      </div>
    </div>
  )
}
