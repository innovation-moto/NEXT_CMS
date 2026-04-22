'use client'

import { useRef, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createPage } from '@/lib/actions/pages'
import BlockEditor from '@/components/admin/BlockEditor'
import type { Block } from '@/types/blocks'
import slugify from 'slugify'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50">
      {pending ? '保存中...' : label}
    </button>
  )
}

export default function NewPagePage() {
  const [state, action] = useFormState(createPage, null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [blocks, setBlocks] = useState<Block[]>([])
  const blocksRef = useRef<Block[]>([])
  const formRef = useRef<HTMLFormElement>(null)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slug) {
      setSlug(slugify(v, { lower: true, strict: true, locale: 'ja' }) || '')
    }
  }

  function handleBlocksChange(b: Block[]) {
    blocksRef.current = b
    setBlocks(b)
  }

  function handleSubmit(formData: FormData) {
    formData.set('blocks', JSON.stringify(blocksRef.current))
    return action(formData)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white">新規固定ページ</h1>
        <div className="flex gap-2">
          <form action={handleSubmit} ref={formRef}>
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="status" value="draft" />
            <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
            <SubmitButton label="下書き保存" />
          </form>
          <form action={handleSubmit}>
            <input type="hidden" name="title" value={title} />
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="status" value="published" />
            <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
            <SubmitButton label="公開する" />
          </form>
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* メインコンテンツ */}
        <div className="space-y-4 lg:col-span-2">
          {/* タイトル */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="タイトルを追加"
            className="w-full border-b border-[#2a2a2a] bg-transparent pb-2 text-3xl font-bold text-white placeholder-[#333] focus:border-accent focus:outline-none"
          />

          {/* ブロックエディタ */}
          <BlockEditor initialBlocks={[]} onChange={handleBlocksChange} />
        </div>

        {/* サイドバー */}
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
