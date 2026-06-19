import { createLesson } from './actions'
import Link from 'next/link'
import { ArrowLeft, Video, FileText } from 'lucide-react'

export default async function NewLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const courseId = (await params).id
  const error = (await searchParams).error

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/courses/${courseId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add New Lesson</h2>
          <p className="text-gray-500 text-sm">Create a new lesson and embed YouTube content.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
            {error}
          </div>
        )}

        <form action={createLesson} className="space-y-6">
          <input type="hidden" name="courseId" value={courseId} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Lesson Title <span className="text-red-500">*</span></label>
              <input 
                id="title" 
                name="title" 
                required 
                type="text" 
                placeholder="e.g. Introduction to Algebra"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="youtube_url" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Video size={16} className="text-red-500" />
                YouTube Video URL
              </label>
              <input 
                id="youtube_url" 
                name="youtube_url" 
                type="url" 
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500">Students will watch this directly on the platform.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="topics" className="block text-sm font-medium text-gray-700">Topics Covered (Comma separated)</label>
              <input 
                id="topics" 
                name="topics" 
                type="text" 
                placeholder="Linear Equations, Variables, Constants"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500">These topics will be used by the AI Exam Builder.</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Lesson Notes / Description</label>
              <textarea 
                id="description" 
                name="description" 
                rows={4}
                placeholder="Important notes for the students..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div className="space-y-2 md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-md flex items-center justify-between">
               <div>
                 <h4 className="font-medium text-gray-900">Publish Immediately</h4>
                 <p className="text-sm text-gray-500">Students enrolled in this course will be able to see the lesson.</p>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" name="is_published" className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
               </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <Link href={`/admin/courses/${courseId}`} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </Link>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium">
              Save Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
