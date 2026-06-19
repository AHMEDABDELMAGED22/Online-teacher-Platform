import '@/app/admin/admin.css' // Reuse the same tailwind injected styles
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { LayoutDashboard, BookOpen, GraduationCap, LineChart, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  
  if (!authData.user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', authData.user.id).single()

  return (
    <div className="admin-layout" dir={profile?.language_pref === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-bold text-primary">Math Elevate</h2>
          <p className="text-sm text-gray-500">Student Space</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/courses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <BookOpen size={20} />
            <span>My Courses</span>
          </Link>
          <Link href="/dashboard/exams" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <GraduationCap size={20} />
            <span>My Exams</span>
          </Link>
          <Link href="/dashboard/progress" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <LineChart size={20} />
            <span>Progress</span>
          </Link>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-3 py-2 mb-2 text-sm font-medium text-gray-800">
            {profile?.full_name || authData.user.email}
          </div>
          <form action={logout}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 transition-colors">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 className="text-xl font-semibold">Student Portal</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
          </div>
        </header>
        
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
