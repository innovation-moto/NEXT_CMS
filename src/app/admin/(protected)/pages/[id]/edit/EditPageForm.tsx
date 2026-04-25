'use client'

import { useRef, useState } from 'react'
import { updatePage } from '@/lib/actions/pages'
import BlockEditor from '@/components/admin/BlockEditor'
import type { Block } from '@/types/blocks'
import Link from 'next/link'

interface Page {
  id: string
  title: string
  slug: string
  status: string
  blocks: Block[]
}

interface Props {
  page: Page
}

export default function EditPageForm({ page }: Props) {
  const [title, setTitle] = useState(page.title)
  const [slug, setSlug] = useState(page.slug)
  const [status, setStatus] = useState(page.status)
  const [blocks, setBlocks] = useState<Block[]>(page.blocks)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const blocksRef = useRef<Block[]>(page.blocks)

  function handleBlocksChange(b: Block[]) {
    blocksRef.current = b
    setBlocks(b)
  }

  async function handleSubmit(newStatus: string) {
    setError(null)
    setSuccess(false)
    setSaving(true)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('status', newStatus)
    formData.set('blocks', JSON.stringify(blocksRef.current))
    const result = await updatePage(page.id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setStatus(newStatus)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/pages" className="text-xs text-[#555] hover:text-white">← 固定ページ一覧</Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">ページを編集</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888] hover:border-accent/40 hover:text-white disabled:opacity-50"
          >
            下書き保存
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {saving ? '保存中...' : status === 'published' ? '更新する' : '公開する'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-800/50 bg-green-900/20 px-4 py-3 text-sm text-green-400">保存しました</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを追加"
            className="w-full border-b border-[#2a2a2a] bg-transparent pb-2 text-3xl font-bold text-white placeholder-[#333] focus:border-accent focus:outline-none"
          />
          <BlockEditor initialBlocks={blocks} onChange={handleBlocksChange} />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">ページ設定</h3>
            <div>
              <label className="mb-1 block text-xs text-[#888]">スラッグ</label>
              <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2">
                <span className="text-xs text-[#555]">/pages/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#888]">ステータス</label>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                status === 'published' ? 'bg-green-900/30 text-green-400' : 'bg-[#1a1a2e] text-[#888]'
              }`}>
                {status === 'published' ? '公開中' : '下書き'}
              </span>
            </div>
            <p className="text-xs text-[#555]">
              公開URL:{' '}
              <a href={`/pages/${slug}`} target="_blank" rel="noopener noreferrer"
                className="text-accent hover:underline">/pages/{slug}</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
