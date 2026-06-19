import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Users, GraduationCap, TrendingUp, CheckCircle2 } from 'lucide-react'

export default async function AdminStudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('*, enrollments(courses(title)), student_progress(*)')
    .eq('role', 'student')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Students & Analytics</h2>
          <p className="text-gray-500 text-sm">Monitor student progress and performance across your courses.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600 uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Enrolled Courses</th>
                <th className="px-6 py-4 font-semibold text-center">Avg Score</th>
                <th className="px-6 py-4 font-semibold text-center">Lessons Completed</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students?.map((student) => {
                const totalProgress = student.student_progress || []
                const avgScore = totalProgress.length > 0 
                  ? Math.round(totalProgress.reduce((acc: number, curr: any) => acc + Number(curr.average_score), 0) / totalProgress.length)
                  : 0
                const completedLessons = totalProgress.reduce((acc: number, curr: any) => acc + (curr.completed_lessons || 0), 0)
                
                const lastActivityRaw = totalProgress.map((p: any) => p.last_activity).filter(Boolean).sort().reverse()[0]
                const lastActivity = lastActivityRaw ? new Date(lastActivityRaw).toLocaleDateString() : 'Never'

                return (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                          {student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.full_name || 'Unnamed Student'}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {student.enrollments && student.enrollments.length > 0 ? (
                          student.enrollments.map((e: any, i: number) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded w-fit">{e.courses.title}</span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not enrolled</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium ${
                        avgScore >= 80 ? 'bg-green-100 text-green-800' :
                        avgScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        avgScore > 0 ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {avgScore > 0 ? `${avgScore}%` : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {completedLessons}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lastActivity}
                    </td>
                  </tr>
                )
              })}
              {(!students || students.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-medium text-gray-900">No students found.</p>
                    <p className="text-sm mt-1">Students will appear here once they register.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
