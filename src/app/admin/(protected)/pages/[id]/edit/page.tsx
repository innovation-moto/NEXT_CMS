'use client'

import { useRef, useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { updatePage } from '@/lib/actions/pages'
import { adminSupabase } from '@/lib/supabase/admin'
import BlockEditor from '@/components/admin/BlockEditor'
import type { Block } from '@/types/blocks'
import { useParams } from 'next/navigation'
import slugify from 'slugify'
import Link from 'next/link'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50">
      {pending ? '保存中...' : label}
    </button>
  )
}

export default function EditPagePage() {
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('draft')
  const [blocks, setBlocks] = useState<Block[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const blocksRef = useRef<Block[]>([])

  useEffect(() => {
    adminSupabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setSlug(data.slug)
          setStatus(data.status)
          const parsed = Array.isArray(data.blocks) ? data.blocks : []
          setBlocks(parsed)
          blocksRef.current = parsed
        }
        setLoading(false)
      })
  }, [id])

  function handleBlocksChange(b: Block[]) {
    blocksRef.current = b
    setBlocks(b)
  }

  async function handleSubmit(newStatus: string) {
    setError(null)
    setSuccess(false)
    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('status', newStatus)
    formData.set('blocks', JSON.stringify(blocksRef.current))
    const result = await updatePage(id, formData)
    if (result?.error) {
      setError(result.error)
    } else {
      setStatus(newStatus)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-[#555]">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/pages" className="text-xs text-[#555] hover:text-white">← 固定ページ一覧</Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">ページを編集</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSubmit('draft')}
            className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888] hover:border-accent/40 hover:text-white">
            下書き保存
          </button>
          <button onClick={() => handleSubmit('published')}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80">
            {status === 'published' ? '更新する' : '公開する'}
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
