import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/Sidebar'
import AdminTopBar from '@/components/admin/TopBar'
import type { Profile } from '@/types/supabase'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // 認証エラー時はchildrenのみ返す（ログインページ等）
    return <>{children}</>
  }

  // ユーザーがいない場合はchildrenのみ（ログインページ）
  // ミドルウェアが保護ルートのリダイレクトを担当する
  if (!user) {
    return <>{children}</>
  }

  const { data } = await supabase
    .from('profiles')
    .select('full_name, role, avatar_url')
    .eq('id', user.id)
    .single()
  const profile = data as Pick<Profile, 'full_name' | 'role' | 'avatar_url'> | null

  return (
    <div className="flex h-screen bg-[#0d0d14] text-white">
      <Suspense fallback={<div className="w-60 flex-shrink-0 bg-[#111118]" />}>
        <AdminSidebar userRole={profile?.role ?? 'editor'} />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar
          user={{
            email: user.email!,
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
