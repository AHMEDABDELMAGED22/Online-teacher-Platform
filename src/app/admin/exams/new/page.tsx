import { createClient } from '@/utils/supabase/server'
import ExamBuilderClient from './ExamBuilderClient'

export default async function NewExamPage() {
  const supabase = await createClient()

  // Fetch data to populate the builder's dropdowns
  const { data: courses } = await supabase.from('courses').select('id, title')
  const { data: lessons } = await supabase.from('lessons').select('id, course_id, title')
  const { data: lessonTopics } = await supabase.from('lesson_topics').select('lesson_id, name')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Exam Builder</h2>
        <p className="text-gray-500 text-sm">Configure and generate mathematics exams using AI.</p>
      </div>

      <ExamBuilderClient 
        courses={courses || []} 
        lessons={lessons || []} 
        lessonTopics={lessonTopics || []} 
      />
    </div>
  )
}
