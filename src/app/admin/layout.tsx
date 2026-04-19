import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'
import type { Profile } from '@/types/supabase'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // クッキーの存在でログイン状態を確認（ネットワーク不要、確実）
  // セキュリティはmiddlewareが担当しているため、layoutはUI表示のみ
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const isLoggedIn = allCookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  // ログインしていない場合はloginページのchildrenのみ
  if (!isLoggedIn) {
    return <>{children}</>
  }

  // ログイン済み：ユーザー情報取得（失敗してもレイアウトは表示する）
  let userEmail = 'admin'
  let profile: Pick<Profile, 'full_name' | 'role' | 'avatar_url'> | null = null

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
      profile = data as typeof profile
    }
  } catch {
    // エラーでもレイアウト（サイドバー・トップバー）は必ず表示
  }

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white">
      <AdminSidebar userRole={profile?.role ?? 'editor'} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar
          user={{
            email: userEmail,
            full_name: profile?.full_name ?? null,
            role: profile?.role ?? 'editor',
            avatar_url: profile?.avatar_url ?? null,
          }}
        />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
