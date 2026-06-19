import { createClient } from '@/utils/supabase/server'
import { BookOpen, Users, FileQuestion, LineChart } from 'lucide-react'

export default async function AdminOverviewPage() {
  const supabase = await createClient()
  
  // Fetch basic stats
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
  const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true })
  const { count: examCount } = await supabase.from('quizzes').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Students</p>
            <h3 className="text-2xl font-bold text-gray-900">{studentCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Courses</p>
            <h3 className="text-2xl font-bold text-gray-900">{courseCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <FileQuestion size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">AI Exams Generated</p>
            <h3 className="text-2xl font-bold text-gray-900">{examCount || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <LineChart size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Avg Class Score</p>
            <h3 className="text-2xl font-bold text-gray-900">--%</h3>
          </div>
        </div>
        
      </div>

      <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <a href="/admin/courses/new" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium">
            Create New Course
          </a>
          <a href="/admin/students/new" className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
            Enroll Student
          </a>
          <a href="/admin/exams/new" className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
            Build AI Exam
          </a>
        </div>
      </div>
    </div>
  )
}
