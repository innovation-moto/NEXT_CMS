'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createSection, deleteSection } from '@/lib/actions/sections'
import type { Section } from '@/types/supabase'

interface Props {
  initialSections: Section[]
}

function IconUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const filename = `icons/${crypto.randomUUID()}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, file, { contentType: file.type, upsert: false })
      if (uploadError) {
        setError(`アップロード失敗: ${uploadError.message}`)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(data.path)
      onChange(publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロード失敗')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[#888888]">アイコン画像</label>
      <div className="flex items-center gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="icon" className="h-12 w-12 rounded-lg border border-[#2a2a2a] object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-[#2a2a2a] bg-[#0a0a0a] text-[#555]">
            <span className="text-xl">📷</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] hover:border-accent/40 hover:text-white disabled:opacity-50"
          >
            {uploading ? 'アップロード中...' : value ? '変更' : '画像をアップロード'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-left text-xs text-[#555] hover:text-red-400"
            >
              削除
            </button>
          )}
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}

export default function SectionsClient({ initialSections }: Props) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [label, setLabel] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [showInNav, setShowInNav] = useState(true)
  const [icon, setIcon] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleLabelChange(value: string) {
    setLabel(value)
    if (!slugEdited) {
      // ラベルからASCII文字のみ抽出してスラッグ候補を生成
      const auto = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setSlug(auto)
    }
  }

  function handleCopy(name: string, id: string) {
    navigator.clipboard.writeText(name)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !slug.trim()) return
    setAdding(true)
    setAddError('')
    const result = await createSection(label.trim(), icon, slug.trim(), showInNav)
    if (result.error) {
      setAddError(result.error)
    } else if (result.data) {
      setSections(prev => [...prev, result.data!])
      setLabel('')
      setSlug('')
      setSlugEdited(false)
      setShowInNav(true)
      setIcon('')
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
        {/* Notion連携の説明ヘッダー */}
        <div className="grid grid-cols-4 border-b border-[#2a2a2a] px-5 py-2 text-xs font-medium text-[#555]">
          <span>セクション</span>
          <span>Notionの「種別」に設定する値</span>
          <span>ナビ表示</span>
          <span />
        </div>
        {sections.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#888888]">セクションがありません。</p>
        ) : (
          <ul className="divide-y divide-[#2a2a2a]">
            {sections.map((s) => (
              <li key={s.id} className="grid grid-cols-4 items-center gap-4 px-5 py-3.5">
                {/* セクション情報 */}
                <div className="flex items-center gap-3">
                  {s.icon?.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.icon} alt={s.label} className="h-8 w-8 flex-shrink-0 rounded-md border border-[#2a2a2a] object-cover" />
                  ) : (
                    <span className="text-xl">{s.icon || '📄'}</span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{s.label}</p>
                    <p className="text-xs text-[#555]">/{s.name}/…</p>
                  </div>
                </div>

                {/* Notion用のSelect値 */}
                <div className="flex items-center gap-2">
                  <code className="rounded-md border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-1.5 font-mono text-xs text-accent">
                    {s.name}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(s.name, s.id)}
                    className="rounded-md border border-[#2a2a2a] px-2.5 py-1.5 text-xs text-[#666] transition-colors hover:border-accent/40 hover:text-white"
                    title="コピー"
                  >
                    {copiedId === s.id ? '✓ コピー済み' : 'コピー'}
                  </button>
                </div>

                {/* ナビ表示フラグ */}
                <div>
                  {s.show_in_nav ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-900/30 px-2 py-0.5 text-xs text-green-400">
                      ✓ 表示
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-2 py-0.5 text-xs text-[#555]">
                      非表示
                    </span>
                  )}
                </div>

                {/* 削除ボタン */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] transition-colors hover:border-red-800/50 hover:text-red-400 disabled:opacity-40"
                  >
                    {deletingId === s.id ? '削除中...' : '削除'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Add new section */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
        <h2 className="mb-4 text-sm font-medium text-white">新しいセクションを追加</h2>
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">
              ラベル（表示名）<span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="例: コラム"
              className={`w-full ${inputClass}`}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">
              スラッグ（URL）<span className="text-accent">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30">
              <span className="pl-4 text-sm text-[#555]">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                  setSlugEdited(true)
                }}
                placeholder="column"
                className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white placeholder-[#555] focus:outline-none"
              />
              <span className="pr-4 text-sm text-[#555]">/…</span>
            </div>
            <p className="mt-1 text-xs text-[#555]">英数字とハイフンのみ使用できます</p>
          </div>

          <div>
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={showInNav}
                  onChange={(e) => setShowInNav(e.target.checked)}
                  className="sr-only"
                />
                <div className={`h-5 w-5 rounded border-2 transition-colors ${showInNav ? 'border-accent bg-accent' : 'border-[#2a2a2a] bg-[#0a0a0a]'}`}>
                  {showInNav && (
                    <svg className="h-full w-full p-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-white">ナビゲーションに表示する</p>
                <p className="text-xs text-[#555]">オフにするとヘッダーメニューに表示されません</p>
              </div>
            </label>
          </div>

          <IconUploader value={icon} onChange={setIcon} />

          {addError && <p className="text-xs text-red-400">{addError}</p>}

          <button
            type="submit"
            disabled={adding || !label.trim() || !slug.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {adding ? '追加中...' : '追加する'}
          </button>
        </form>
      </div>

      {/* Notion連携の説明 */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 px-5 py-4 space-y-2">
        <p className="text-xs font-medium text-accent">🔗 Notionとの連携方法</p>
        <ol className="space-y-1.5 text-xs text-[#888888] list-decimal list-inside">
          <li>Notionデータベースの「種別」プロパティ（Select）を開く</li>
          <li>上の表の <span className="font-mono text-accent">Notion用の値</span> をそのまま新しいSelectオプションとして追加</li>
          <li>記事ページの「種別」をそのオプションに設定する</li>
          <li>次回の同期（5分以内）で自動的に該当セクションに振り分けられる</li>
        </ol>
      </div>
    </div>
  )
}
