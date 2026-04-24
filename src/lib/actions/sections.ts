'use server'

import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import type { Section } from '@/types/supabase'
import slugify from 'slugify'

export type { Section }

export async function getSections(): Promise<Section[]> {
  const { data } = await adminSupabase
    .from('sections')
    .select('*')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function createSection(
  label: string,
  icon: string
): Promise<{ data?: Section; error?: string }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: '認証が必要です' }

  const name = slugify(label, { lower: true, strict: true, locale: 'ja' }) || `section-${Date.now()}`

  const { data: existing } = await adminSupabase
    .from('sections')
    .select('id')
    .eq('name', name)
    .maybeSingle()
  if (existing) return { error: `"${name}" は既に使用されています` }

  const { data: maxRow } = await adminSupabase
    .from('sections')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await adminSupabase
    .from('sections')
    .insert({ name, label, icon, sort_order })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: data as Section }
}

export async function deleteSection(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: '認証が必要です' }

  const { error } = await adminSupabase.from('sections').delete().eq('id', id)
  if (error) return { error: error.message }
  return {}
}
