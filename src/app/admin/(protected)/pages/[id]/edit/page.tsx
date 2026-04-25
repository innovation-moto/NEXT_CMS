import { adminSupabase } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import EditPageForm from './EditPageForm'
import type { Block } from '@/types/blocks'

export const dynamic = 'force-dynamic'

export default async function EditPagePage({ params }: { params: { id: string } }) {
  const { data: page } = await adminSupabase
    .from('pages')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!page) notFound()

  const blocks: Block[] = Array.isArray(page.blocks) ? (page.blocks as Block[]) : []

  return (
    <EditPageForm
      page={{
        id: page.id,
        title: page.title,
        slug: page.slug,
        status: page.status,
        blocks,
      }}
    />
  )
}
