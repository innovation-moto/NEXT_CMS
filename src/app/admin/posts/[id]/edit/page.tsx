'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { updatePost } from '@/lib/actions/posts'
import { createCategory, deleteCategory, type Category } from '@/lib/actions/categories'
import RichTextEditor from '@/components/admin/RichTextEditor'
import ImageUploader from '@/components/admin/ImageUploader'
import { createClient } from '@/lib/supabase/client'
import type { Post } from '@/types/supabase'

export default function EditPostPage() {
  const params = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [postType, setPostType] = useState('blog')
  const [status, setStatus] = useState('draft')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [publishedAt, setPublishedAt] = useState('')

  // カテゴリ
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState('')
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

  useEffect(() => {
    async function fetchPost() {
      const supabase = createClient()
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) {
        setPost(data)
        setTitle(data.title)
        setSlug(data.slug)
        setPostType(data.type)
        setStatus(data.status)
        setExcerpt(data.excerpt ?? '')
        setBody(data.body ?? '')
        setThumbnail(data.thumbnail ?? '')
        setCategoryId((data as any).category_id ?? '')

        const defaultDate = (() => {
          const now = new Date()
          return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
        })()
        setPublishedAt(data.published_at ? data.published_at.slice(0, 16) : defaultDate)

        // 投稿タイプに合わせてカテゴリを取得（ブラウザクライアントで直接取得）
        supabase
          .from('categories')
          .select('*')
          .eq('type', data.type)
          .order('sort_order', { ascending: true })
          .then(({ data: cats, error }) => {
            if (error) console.error('カテゴリ取得エラー:', error)
            if (cats) setCategories(cats as Category[])
          })
      }
      setLoading(false)
    }
    fetchPost()
  }, [params.id])

  // カテゴリを削除
  async function handleDeleteCategory(id: string) {
    setDeletingCategoryId(id)
    const result = await deleteCategory(id)
    if (!result.error) {
      setCategories(prev => prev.filter(c => c.id !== id))
      if (categoryId === id) setCategoryId('')
    }
    setDeletingCategoryId(null)
  }

  // 新しいカテゴリを追加
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

    const result = await updatePost(params.id, formData)
    if (result?.error) {
      setErrors(result.error.fieldErrors ?? {})
      setFormError(
        result.error.formErrors?.length
          ? result.error.formErrors[0]
          : '入力内容にエラーがあります。各項目を確認してください。'
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[#888888]">読み込み中...</p>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-[#888888]">投稿が見つかりませんでした。</p>
      </div>
    )
  }

  const typeLabel = postType === 'news' ? 'ニュース' : 'ブログ'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
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

      {/* 成功トースト */}
      {savedMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-800/50 bg-green-900/20 px-4 py-3">
          <span className="text-green-400">✓</span>
          <p className="text-sm font-medium text-green-400">保存しました</p>
        </div>
      )}

      {/* エラーアラート */}
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
        {/* Main */}
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

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
            <ImageUploader value={thumbnail} onChange={setThumbnail} />
          </div>

          <div className="space-y-4 rounded-xl border border-[#2a2a2a] bg-[#111118] p-5">
            <h3 className="text-sm font-medium text-white">投稿設定</h3>

            {/* カテゴリ */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">カテゴリ</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">カテゴリなし</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              {!showNewCategory ? (
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
                  >
                    <span>＋</span> 新しいカテゴリを追加
                  </button>
                  {categories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowManageCategories(v => !v)}
                      className="flex items-center gap-1 text-xs text-[#666] hover:text-[#aaa]"
                    >
                      {showManageCategories ? '▲ 管理を閉じる' : '▼ カテゴリを管理'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory() } }}
                    placeholder="カテゴリ名を入力..."
                    autoFocus
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-xs text-white placeholder-[#555] focus:border-accent focus:outline-none"
                  />
                  {categoryError && <p className="text-xs text-red-400">{categoryError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={addingCategory || !newCategoryName.trim()}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-accent/80 disabled:opacity-50"
                    >
                      {addingCategory ? '追加中...' : '追加'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(''); setCategoryError('') }}
                      className="rounded-lg border border-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] hover:text-white"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {/* カテゴリ管理（削除） */}
              {showManageCategories && !showNewCategory && (
                <div className="mt-2 space-y-1 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] p-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-[#1a1a1a]">
                      <span className="text-xs text-[#aaa]">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        disabled={deletingCategoryId === cat.id}
                        className="text-[#555] hover:text-red-400 disabled:opacity-40 transition-colors"
                        title="削除"
                      >
                        {deletingCategoryId === cat.id ? (
                          <span className="text-xs">...</span>
                        ) : (
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

            {/* ステータス */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">ステータス</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="archived">アーカイブ</option>
              </select>
            </div>

            {/* 公開日時 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#888888]">公開日時</label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-[#555]">未入力で公開すると保存時刻が自動設定されます</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
