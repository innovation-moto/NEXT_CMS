import { getSections } from '@/lib/actions/sections'
import { getCategories } from '@/lib/actions/categories'
import NewPostForm from './NewPostForm'

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const sections = await getSections()

  const firstSection = sections[0]
  const requestedType = searchParams.type
  const matchedSection = sections.find((s) => s.name === requestedType)
  const activeSection = matchedSection ?? firstSection

  const defaultType = activeSection?.name ?? 'blog'
  const defaultLabel = activeSection?.label ?? defaultType

  const initialCategories = await getCategories(defaultType)

  return (
    <NewPostForm
      defaultType={defaultType}
      defaultLabel={defaultLabel}
      initialCategories={initialCategories}
    />
  )
}
