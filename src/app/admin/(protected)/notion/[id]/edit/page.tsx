import { adminSupabase } from '@/lib/supabase/admin'
import { getCategories } from '@/lib/actions/categories'
import { getSections } from '@/lib/actions/sections'
import { notFound } from 'next/navigation'
import NotionEditForm from './EditForm'
import type { Post } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export default async function NotionEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: post } = await adminSupabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const [categories, sections] = await Promise.all([
    getCategories(post.type),
    getSections(),
  ])

  return <NotionEditForm post={post as Post} initialCategories={categories} sections={sections} />
}
