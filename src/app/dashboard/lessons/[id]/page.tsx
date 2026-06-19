import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const lessonId = (await params).id
  const supabase = await createClient()

  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect('/login')

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*, courses(*), quizzes(*)')
    .eq('id', lessonId)
    .eq('is_published', true)
    .single()

  if (!lesson) return <div>Lesson not found.</div>

  // Verify enrollment
  const { data: enrollment } = await supabase.from('enrollments').select('*').eq('course_id', lesson.course_id).eq('student_id', authData.user.id).single()
  if (!enrollment) redirect('/dashboard')

  // Extract YouTube video ID
  let videoId = ''
  if (lesson.youtube_url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = lesson.youtube_url.match(regExp);
    videoId = (match && match[2].length === 11) ? match[2] : '';
  }

  // Update progress tracking (mark lesson as watched, best effort)
  // In a real app we might trigger this via an API route when they actually press play or finish, but loading the page counts as starting.
  const { data: progress } = await supabase.from('student_progress').select('*').eq('course_id', lesson.course_id).eq('student_id', authData.user.id).single()
  if (progress) {
    await supabase.from('student_progress').update({ 
      watched_videos: (progress.watched_videos || 0) + 1,
      last_activity: new Date().toISOString()
    }).eq('id', progress.id)
  } else {
    await supabase.from('student_progress').insert([{
      student_id: authData.user.id,
      course_id: lesson.course_id,
      watched_videos: 1
    }])
  }

  const publishedQuizzes = lesson.quizzes?.filter((q: any) => q.is_published) || []

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/courses/${lesson.course_id}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{lesson.title}</h2>
          <p className="text-primary text-sm font-medium">{lesson.courses.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden shadow-md aspect-video relative">
            {videoId ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              ></iframe>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No video provided for this lesson.
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Lesson Notes</h3>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {lesson.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {publishedQuizzes.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Knowledge Check
              </h3>
              <div className="space-y-3">
                {publishedQuizzes.map((quiz: any) => (
                  <Link key={quiz.id} href={`/dashboard/exams/${quiz.id}`} className="block w-full text-center py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors shadow-sm">
                    Take {quiz.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Attached Files</h3>
            <div className="text-center py-4 text-gray-500 text-sm">
              No PDFs uploaded for this lesson.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
