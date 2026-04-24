'use client'

import { useState } from 'react'
import { createSection, deleteSection } from '@/lib/actions/sections'
import type { Section } from '@/types/supabase'

interface Props {
  initialSections: Section[]
}

export default function SectionsClient({ initialSections }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('📄')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return
    setAdding(true)
    setAddError('')
    const result = await createSection(label.trim(), icon)
    if (result.error) {
      setAddError(result.error)
    } else if (result.data) {
      setSections(prev => [...prev, result.data!])
      setLabel('')
      setIcon('📄')
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('このセクションを削除しますか？\n※ このセクションの投稿は削除されません。')) return
    setDeletingId(id)
    const result = await deleteSection(id)
    if (!result.error) {
      setSections(prev => prev.filter(s => s.id !== id))
    }
    setDeletingId(null)
  }

  const inputClass =
    'rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'

  return (
    <div className="space-y-6">
      {/* Current sections */}
      <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#111118]">
        <div className="border-b border-[#2a2a2a] bg-[#1a1a28] px-5 py-3">
          <h2 className="text-sm font-medium text-white">登録済みセクション</h2>
        </div>
        {sections.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#888888]">セクションがありません。</p>
        ) : (
          <ul className="divide-y divide-[#2a2a2a]">
            {sections.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="text-xs text-[#555]">/{s.name}/…</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={deletingId === s.id}
                  className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] transition-colors hover:border-red-800/50 hover:text-red-400 disabled:opacity-40"
                >
                  {deletingId === s.id ? '削除中...' : '削除'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add new section */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
        <h2 className="mb-4 text-sm font-medium text-white">新しいセクションを追加</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">
                ラベル（表示名）<span className="text-accent">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="例: コラム"
                className={`w-full ${inputClass}`}
              />
              <p className="mt-1 text-xs text-[#555]">URLは自動生成されます（例: /column/...）</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">アイコン（絵文字）</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="📄"
                className={`w-full ${inputClass}`}
              />
            </div>
          </div>

          {addError && <p className="text-xs text-red-400">{addError}</p>}

          <button
            type="submit"
            disabled={adding || !label.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {adding ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a28] px-5 py-4">
        <p className="text-xs text-[#666]">
          セクションを追加すると、サイドバーのナビゲーションと記事の種別選択に反映されます。
          フロントエンドには <code className="rounded bg-[#2a2a2a] px-1 py-0.5 font-mono text-[#aaa]">/[セクション名]/</code> のURLでアクセスできます。
        </p>
      </div>
    </div>
  )
}
