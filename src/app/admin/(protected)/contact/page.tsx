import { adminSupabase } from '@/lib/supabase/admin'
import { formatDate } from '@/lib/utils'
import MarkReadButton from './MarkReadButton'
import type { ContactMessage } from '@/types/supabase'

export default async function AdminContactPage() {
  const { data } = await adminSupabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  const messages = data as ContactMessage[] | null

  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">お問い合わせ</h1>
        <p className="text-sm text-[#888888]">
          全 {messages?.length ?? 0} 件
          {unreadCount > 0 && (
            <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
              未読 {unreadCount}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl border p-5 transition-all ${
              msg.is_read
                ? 'border-[#2a2a2a] bg-[#111118]'
                : 'border-accent/30 bg-accent/5'
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  {!msg.is_read && (
                    <span className="h-2 w-2 rounded-full bg-accent flex-shrink-0" />
                  )}
                  <p className="font-medium text-white">{msg.name}</p>
                  <span className="text-xs text-[#888888]">{msg.email}</span>
                </div>
                {msg.subject && (
                  <p className="mt-0.5 text-sm font-medium text-[#e8e8e8]">{msg.subject}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <time className="text-xs text-[#888888]">
                  {formatDate(msg.created_at)}
                </time>
                <MarkReadButton messageId={msg.id} isRead={msg.is_read ?? false} />
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#888888]">
              {msg.message}
            </p>
          </div>
        )) ?? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] py-16 text-center">
            <span className="mb-3 text-4xl">📭</span>
            <p className="text-sm text-[#888888]">お問い合わせはまだありません。</p>
          </div>
        )}
      </div>
    </div>
  )
}
