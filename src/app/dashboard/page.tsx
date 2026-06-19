import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { BookOpen, PlayCircle, Trophy } from 'lucide-react'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()

  // Fetch enrolled courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('courses(*)')
    .eq('student_id', authData.user?.id)

  // Fetch progress
  const { data: progress } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', authData.user?.id)

  const activeCourses = enrollments?.map(e => e.courses) || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-gray-900">{activeCourses.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <PlayCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Completed Lessons</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {progress?.reduce((acc, curr) => acc + (curr.completed_lessons || 0), 0) || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-900">
               {progress && progress.length > 0 
                  ? Math.round(progress.reduce((acc, curr) => acc + Number(curr.average_score), 0) / progress.length)
                  : 0}%
            </h3>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">My Courses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCourses.map((course: any) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-indigo-50 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description || 'Continue your learning journey.'}</p>
              
              <div className="text-primary font-medium text-sm group-hover:underline">
                View Lessons &rarr;
              </div>
            </Link>
          ))}

          {activeCourses.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
              <p className="text-gray-500 mt-1 mb-4">You have not been assigned to any courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
