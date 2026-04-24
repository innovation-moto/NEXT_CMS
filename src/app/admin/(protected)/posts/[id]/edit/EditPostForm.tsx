'use client'

import { useState } from 'react'
import { updatePost } from '@/lib/actions/posts'
import { createCategory, deleteCategory, type Category } from '@/lib/actions/categories'
import RichTextEditor from '@/components/admin/RichTextEditor'
import DateTimePicker from '@/components/admin/DateTimePicker'
import ImageUploader from '@/components/admin/ImageUploader'
import type { Post, Section } from '@/types/supabase'

interface Props {
  post: Post
  initialCategories: Category[]
  sections: Section[]
}

export default function EditPostForm({ post, initialCategories, sections }: Props) {
  const [title, setTitle] = useState(post.title)
  const [slug, setSlug] = useState(post.slug)
  const [postType, setPostType] = useState<string>(post.type)
  const [status, setStatus] = useState(post.status)
  const [excerpt, setExcerpt] = useState(post.excerpt ?? '')
  const [body, setBody] = useState(post.body ?? '')
  const [thumbnail, setThumbnail] = useState(post.thumbnail ?? '')

  const defaultDate = (() => {
    const now = new Date()
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  })()
  const [publishedAt, setPublishedAt] = useState(
    post.published_at ? post.published_at.slice(0, 16) : defaultDate
  )

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [categoryId, setCategoryId] = useState(post.category_id ?? '')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState('')
  const [showManageCategories, setShowManageCategories] = useState(false)
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null)

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  async function handleDeleteCategory(id: string) {
    setDeletingCategoryId(id)
    const result = await deleteCategory(id)
    if (!result.error) {
      setCategories(prev => prev.filter(c => c.id !== id))
      if (categoryId === id) setCategoryId('')
    }
    setDeletingCategoryId(null)
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return
    setAddingCategory(true)
    setCategoryError('')
    const result = await createCategory(newCategoryName, postType)
    if (result.error) {
      setCategoryError(result.error)
    } else if (result.data) {
      setCategories(prev => [...prev, result.data!])
      setCategoryId(result.data.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    }
    setAddingCategory(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const formData = new FormData()
    formData.set('title', title)
    formData.set('slug', slug)
    formData.set('type', postType)
    formData.set('status', status)
    formData.set('excerpt', excerpt)
    formData.set('body', body)
    formData.set('thumbnail', thumbnail)
    formData.set('category_id', categoryId)
    formData.set('published_at', status === 'published' && publishedAt ? new Date(publishedAt).toISOString() : '')

    const result = await updatePost(post.id, formData)
    if (result?.error) {
      setErrors(result.error.fieldErrors ?? {})
      setFormError(
        result.error.formErrors?.length ? result.error.formErrors[0] : '入力内容にエラーがあります。各項目を確認してください。'
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setFormError(null)
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    }
    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'

  const typeLabel = sections.find(s => s.name === postType)?.label ?? postType

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">投稿を編集</h1>
          <p className="mt-1 text-xs text-[#555]">種別: {typeLabel}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/${post.type}/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888888] hover:border-accent/40 hover:text-white"
          >
            プレビュー
          </a>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {submitting ? '保存中...' : '保存する'}
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-800/50 bg-green-900/20 px-4 py-3">
          <span className="text-green-400">✓</span>
          <p className="text-sm font-medium text-green-400">保存しました</p>
        </div>
      )}

      {formError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3">
          <span className="mt-0.5 text-red-400">⚠️</span>
          <div>
            <p className="text-sm font-medium text-red-400">保存できませんでした</p>
            <p className="mt-0.5 text-xs text-red-400/80">{formError}</p>
          </div>
          <button type="button" onClick={() => setFormError(null)} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">タイトル *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title[0]}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">スラッグ</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
            {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug[0]}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">抜粋</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#888888]">本文</label>
            <RichTextEditor content={body} onChange={setBody} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
            <ImageUploader value={thumbnail} onChange={setThumbnail} />
          </div>

          <div className="space-y-4 rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
            <h3 className="text-sm font-medium text-white">投稿設定</h3>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">カテゴリ</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                <option value="">カテゴリなし</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {!showNewCategory ? (
                <div className="mt-2 flex items-center gap-3">
                  <button type="button" onClick={() => setShowNewCategory(true)} className="flex items-center gap-1 text-xs text-accent hover:text-accent/80">
                    <span>＋</span> 新しいカテゴリを追加
                  </button>
                  {categories.length > 0 && (
                    <button type="button" onClick={() => setShowManageCategories(v => !v)} className="flex items-center gap-1 text-xs text-[#666] hover:text-[#aaa]">
                      {showManageCategories ? '▲ 管理を閉じる' : '▼ カテゴリを管理'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                    placeholder="カテゴリ名を入力..." autoFocus
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-xs text-white placeholder-[#555] focus:border-accent focus:outline-none"
                  />
                  {categoryError && <p className="text-xs text-red-400">{categoryError}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={handleAddCategory} disabled={addingCategory || !newCategoryName.trim()} className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/80 disabled:opacity-50">
                      {addingCategory ? '追加中...' : '追加'}
                    </button>
                    <button type="button" onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setCategoryError('') }} className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] hover:text-white">
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
              {showManageCategories && !showNewCategory && (
                <div className="mt-2 space-y-1 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-[#1a1a1a]">
                      <span className="text-xs text-[#aaa]">{cat.name}</span>
                      <button type="button" onClick={() => handleDeleteCategory(cat.id)} disabled={deletingCategoryId === cat.id} className="text-[#555] hover:text-red-400 disabled:opacity-40 transition-colors" title="削除">
                        {deletingCategoryId === cat.id ? <span className="text-xs">...</span> : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">種別</label>
              <select value={postType} onChange={(e) => setPostType(e.target.value)} className={inputClass}>
                {sections.map((s) => (
                  <option key={s.id} value={s.name}>{s.label}</option>
                ))}
                {sections.length === 0 && <option value={postType}>{postType}</option>}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">ステータス</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'archived')} className={inputClass}>
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="archived">アーカイブ</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">公開日時</label>
              <DateTimePicker value={publishedAt} onChange={setPublishedAt} />
              <p className="mt-1 text-xs text-[#555]">未入力で公開すると保存時刻が自動設定されます</p>
            </div>
          </div>

          {post.meta && typeof post.meta === 'object' && !Array.isArray(post.meta) && Object.keys(post.meta).length > 0 && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
              <h3 className="mb-3 text-sm font-medium text-white">Notionプロパティ</h3>
              <div className="space-y-2">
                {Object.entries(post.meta as Record<string, unknown>).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-[#555]">{key}</p>
                    {Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && (value[0] as string).includes('/storage/v1/object/') ? (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(value as string[]).map((url, i) => (
                          <img key={i} src={url} alt={key} className="h-16 w-16 rounded object-cover border border-[#2a2a2a]" />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-0.5 text-xs text-[#aaa] break-all">
                        {Array.isArray(value) ? (value as unknown[]).join(', ') : String(value ?? '')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
