import './admin.css'
import Link from 'next/link'
import { logout } from '@/app/login/actions'
import { LayoutDashboard, Users, BookOpen, FileText, Settings, LogOut, FileQuestion, LineChart } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-bold text-primary">Math Elevate</h2>
          <p className="text-sm text-gray-500">Teacher Dashboard</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <Link href="/admin/courses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <BookOpen size={20} />
            <span>Courses</span>
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <Users size={20} />
            <span>Students</span>
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <FileQuestion size={20} />
            <span>Exam Builder</span>
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-primary transition-colors">
            <LineChart size={20} />
            <span>Analytics</span>
          </Link>
        </nav>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
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
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              T
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
