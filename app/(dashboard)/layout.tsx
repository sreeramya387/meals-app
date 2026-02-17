import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth/session'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    redirect('/login')
  }

  const user = await getUserFromSession(token)

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
