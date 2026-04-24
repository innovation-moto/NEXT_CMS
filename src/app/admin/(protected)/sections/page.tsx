import { getSections } from '@/lib/actions/sections'
import SectionsClient from './SectionsClient'

export const dynamic = 'force-dynamic'

export default async function SectionsPage() {
  const sections = await getSections()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">セクション管理</h1>
        <p className="mt-1 text-sm text-[#888888]">コンテンツの種別（セクション）を管理します</p>
      </div>
      <SectionsClient initialSections={sections} />
    </div>
  )
}
