'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleMessageRead(id: string, isRead: boolean) {
  // 認証チェック
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: '認証が必要です' }

  const { error } = await adminSupabase
    .from('contact_messages')
    .update({ is_read: !isRead })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/contact')
  return { success: true }
}
