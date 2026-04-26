import { unstable_noStore as noStore } from 'next/cache'
import { adminSupabase } from '@/lib/supabase/admin'
import HeaderClient from './HeaderClient'

export default async function Header() {
  noStore()
  const { data: sections } = await adminSupabase
    .from('sections')
    .select('name, label')
    .eq('show_in_nav', true)
    .order('sort_order', { ascending: true })

  const sectionLinks = (sections ?? []).map((s) => ({
    href: `/${s.name}`,
    label: s.label,
  }))

  return <HeaderClient sectionLinks={sectionLinks} />
}
