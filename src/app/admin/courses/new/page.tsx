import { createCourse } from './actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const error = (await searchParams).error

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Create New Course</h2>
          <p className="text-gray-500 text-sm">Set up a new mathematics course to assign lessons and students.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form action={createCourse} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title <span className="text-red-500">*</span></label>
            <input 
              id="title" 
              name="title" 
              required 
              type="text" 
              placeholder="e.g. Algebra I, Grade 10 Mathematics"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Course Description</label>
            <textarea 
              id="description" 
              name="description" 
              rows={4}
              placeholder="Brief description of what this course covers..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/admin/courses" className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </Link>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium">
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
