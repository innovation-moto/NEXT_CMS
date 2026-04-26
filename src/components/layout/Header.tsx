import { adminSupabase } from '@/lib/supabase/admin'
import HeaderClient from './HeaderClient'

export default async function Header() {
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
