'use client'

import { useRef, useState, useTransition } from 'react'
import { createPage } from '@/lib/actions/pages'
import BlockEditor from '@/components/admin/BlockEditor'
import type { Block } from '@/types/blocks'
import slugify from 'slugify'
import Link from 'next/link'

export default function NewPagePage() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const blocksRef = useRef<Block[]>([])

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slug) {
      const generated = slugify(v, { lower: true, strict: true, locale: 'ja' })
      if (generated) setSlug(generated)
    }
  }

  function handleBlocksChange(b: Block[]) {
    blocksRef.current = b
    setBlocks(b)
  }

  function handleSubmit(status: 'draft' | 'published') {
    setError(null)
    const formData = new FormData()
    formData.set('title', title || 'タイトルなし')
    formData.set('slug', slug)
    formData.set('status', status)
    formData.set('blocks', JSON.stringify(blocksRef.current))

    startTransition(async () => {
      const result = await createPage(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/pages" className="text-xs text-[#555] hover:text-white">← 固定ページ一覧</Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">新規固定ページ</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
            className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888] hover:border-accent/40 hover:text-white disabled:opacity-50"
          >
            {isPending ? '保存中...' : '下書き保存'}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={isPending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {isPending ? '保存中...' : '公開する'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="タイトルを追加"
            className="w-full border-b border-[#2a2a2a] bg-transparent pb-2 text-3xl font-bold text-white placeholder-[#333] focus:border-accent focus:outline-none"
          />
          <BlockEditor initialBlocks={[]} onChange={handleBlocksChange} />
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
                  placeholder="page-slug"
                  className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-[#555]">
              公開URL: <span className="text-accent">/pages/{slug || '...'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
