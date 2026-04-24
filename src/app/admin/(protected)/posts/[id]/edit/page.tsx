import { adminSupabase } from '@/lib/supabase/admin'
import { getCategories } from '@/lib/actions/categories'
import { getSections } from '@/lib/actions/sections'
import { notFound } from 'next/navigation'
import EditPostForm from './EditPostForm'
import type { Post } from '@/types/supabase'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const { data: post } = await adminSupabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!post) notFound()

  const [categories, sections] = await Promise.all([
    getCategories(post.type),
    getSections(),
  ])

  return <EditPostForm post={post as Post} initialCategories={categories} sections={sections} />
}
