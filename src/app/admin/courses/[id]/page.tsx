import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, Play, FileText, CheckCircle2 } from 'lucide-react'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const courseId = (await params).id
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, lessons(*)')
    .eq('id', courseId)
    .single()

  if (!course) {
    return <div>Course not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{course.title}</h2>
          <p className="text-gray-500 text-sm">Course Details & Lessons</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area: Lessons List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Lessons</h3>
              <Link href={`/admin/courses/${course.id}/lessons/new`} className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary-hover transition-colors font-medium">
                <Plus size={16} />
                Add Lesson
              </Link>
            </div>

            <div className="space-y-3">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons.map((lesson: any) => (
                  <Link key={lesson.id} href={`/admin/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-primary/30 hover:bg-indigo-50/30 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-md ${lesson.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        {lesson.is_published ? <CheckCircle2 size={20} /> : <Play size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{lesson.title}</h4>
                        <p className="text-xs text-gray-500">{new Date(lesson.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${lesson.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {lesson.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No lessons added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Area: Enrolled Students & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">About this Course</h3>
            <p className="text-sm text-gray-600 mb-4">{course.description || 'No description'}</p>
            <div className="text-xs text-gray-500 flex justify-between border-t border-gray-100 pt-4">
              <span>Created: {new Date(course.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Enrolled Students</h3>
              <Link href={`/admin/students?enroll=${course.id}`} className="text-sm text-primary hover:underline font-medium">
                Manage
              </Link>
            </div>
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">Enrollments view placeholder</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
