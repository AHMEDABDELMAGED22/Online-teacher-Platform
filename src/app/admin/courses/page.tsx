import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, Clock } from 'lucide-react'

export default async function AdminCoursesPage() {
  const supabase = await createClient()
  
  const { data: courses } = await supabase
    .from('courses')
    .select('*, lessons(count)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Courses</h2>
          <p className="text-gray-500 text-sm">Manage your mathematics courses and lessons.</p>
        </div>
        <Link href="/admin/courses/new" className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium">
          <Plus size={18} />
          Create Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course) => (
          <Link key={course.id} href={`/admin/courses/${course.id}`} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description || 'No description provided.'}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen size={14} />
                <span>{course.lessons[0]?.count || 0} Lessons</span>
              </div>
            </div>
          </Link>
        ))}

        {(!courses || courses.length === 0) && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
            <p className="text-gray-500 mt-1 mb-4">Get started by creating your first mathematics course.</p>
            <Link href="/admin/courses/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium">
              <Plus size={18} />
              Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
