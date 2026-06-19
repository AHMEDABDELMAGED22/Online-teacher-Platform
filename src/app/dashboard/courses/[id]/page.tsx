import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, PlayCircle, FileQuestion, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const courseId = (await params).id
  const supabase = await createClient()

  // Ensure enrolled
  const { data: authData } = await supabase.auth.getUser()
  const { data: enrollment } = await supabase.from('enrollments').select('*').eq('course_id', courseId).eq('student_id', authData.user?.id).single()
  
  if (!enrollment) redirect('/dashboard')

  const { data: course } = await supabase
    .from('courses')
    .select(`
      *, 
      lessons(
        *,
        quizzes(*)
      )
    `)
    .eq('id', courseId)
    .single()

  if (!course) return <div>Course not found.</div>

  const publishedLessons = course.lessons.filter((l: any) => l.is_published).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
          <p className="text-gray-500 text-sm">{course.description}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Course Material</h3>
        
        <div className="space-y-4">
          {publishedLessons.length > 0 ? (
            publishedLessons.map((lesson: any, index: number) => {
              const publishedQuizzes = lesson.quizzes?.filter((q: any) => q.is_published) || []
              
              return (
                <div key={lesson.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <Link href={`/dashboard/lessons/${lesson.id}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-primary hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">Watch Video Lesson</span>
                      </div>
                      <span className="text-xs text-primary bg-indigo-50 px-2 py-1 rounded">Start Learning</span>
                    </Link>

                    {publishedQuizzes.map((quiz: any) => (
                      <Link key={quiz.id} href={`/dashboard/exams/${quiz.id}`} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-green-500 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <FileQuestion className="text-gray-400 group-hover:text-green-500 transition-colors" />
                          <div>
                            <span className="font-medium text-gray-700 group-hover:text-green-600 transition-colors block">{quiz.title}</span>
                            <span className="text-xs text-gray-500 capitalize">{quiz.type} • {quiz.difficulty}</span>
                          </div>
                        </div>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Take Exam</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              No lessons have been published for this course yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
