import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // admin のみアクセス可能
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'admin') {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[#888888]">管理者のみアクセスできます。</p>
      </div>
    )
  }

  const { data: profiles } = await adminSupabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
  const authUsersMap = new Map(authUsers.users.map((u) => [u.id, u]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">ユーザー管理</h1>
          <p className="text-sm text-[#888888]">全 {profiles?.length ?? 0} 名</p>
        </div>
        <Link
          href="/admin/users/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80"
        >
          + ユーザーを追加
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111118]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a] bg-[#1a1a28]">
              <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">名前</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">メール</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">ロール</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-[#888888]">作成日</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a]">
            {profiles?.map((profile) => {
              const authUser = authUsersMap.get(profile.id)
              return (
                <tr key={profile.id} className="hover:bg-[#1a1a28] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                        {(profile.full_name ?? 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{profile.full_name ?? '—'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#888888]">
                    {authUser?.email ?? '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        profile.role === 'admin'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-[#2a2a2a] text-[#888888]'
                      }`}
                    >
                      {profile.role === 'admin' ? '管理者' : '編集者'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#888888]">
                    {formatDate(profile.created_at)}
                  </td>
                </tr>
              )
            }) ?? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-[#888888]">
                  ユーザーが見つかりませんでした。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
