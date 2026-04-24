import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'
import { getSections } from '@/lib/actions/sections'

// このレイアウトは /admin/login 以外の全管理画面に適用される
// /admin/login はこのレイアウトの外（親の layout.tsx のみ）なので無限ループにならない

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // クッキーの存在でログイン状態を確認（sb-{projectRef}-auth-token 形式）
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  // 未ログイン → ログインページへ（このレイアウトは /admin/login に適用されないため無限ループなし）
  if (!isLoggedIn) {
    redirect('/admin/login')
  }

  // ログイン済み：ユーザー情報取得
  let userEmail = 'admin'
  let userRole: 'admin' | 'editor' = 'editor'
  let fullName: string | null = null
  let avatarUrl: string | null = null

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      userEmail = session.user.email ?? 'admin'
      const { data } = await supabase
        .from('profiles')
        .select('full_name, role, avatar_url')
        .eq('id', session.user.id)
        .single()
      if (data) {
        const row = data as { full_name: string | null; role: string; avatar_url: string | null }
        userRole = row.role === 'admin' ? 'admin' : 'editor'
        fullName = row.full_name
        avatarUrl = row.avatar_url
      }
    }
  } catch {
    // エラーでもレイアウトは必ず表示
  }

  const sections = await getSections()

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white">
      <AdminSidebar userRole={userRole} sections={sections} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar
          user={{
            email: userEmail,
            full_name: fullName,
            role: userRole,
            avatar_url: avatarUrl,
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
