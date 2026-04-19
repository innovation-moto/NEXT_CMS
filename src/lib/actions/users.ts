'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { userSchema } from '@/lib/validations/user'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: '認証が必要です' }
  const user = session.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return { error: '管理者権限が必要です' }

  return { user, supabase }
}

export async function createUser(formData: FormData) {
  const authResult = await requireAdmin()
  if ('error' in authResult) return authResult

  const parsed = userSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { data: authUser, error: createError } =
    await adminSupabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      user_metadata: { full_name: parsed.data.full_name },
      email_confirm: true,
    })

  if (createError) return { error: createError.message }

  await adminSupabase
    .from('profiles')
    .update({ role: parsed.data.role, full_name: parsed.data.full_name })
    .eq('id', authUser.user.id)

  return { success: true }
}

export async function updateUserRole(userId: string, role: 'admin' | 'editor') {
  const authResult = await requireAdmin()
  if ('error' in authResult) return authResult

  const { error } = await adminSupabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteUser(userId: string) {
  const authResult = await requireAdmin()
  if ('error' in authResult) return authResult

  const { error } = await adminSupabase.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  return { success: true }
}
