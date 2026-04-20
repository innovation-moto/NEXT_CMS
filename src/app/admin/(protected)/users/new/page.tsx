'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/lib/actions/users'

export default function NewUserPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createUser(formData)

    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : '入力内容を確認してください。')
      setSubmitting(false)
    } else {
      router.push('/admin/users')
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#555] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-2xl font-bold text-white">ユーザーを追加</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-[#2a2a2a] bg-[#111118] p-6"
      >
        {error && (
          <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#888888]">
            名前 <span className="text-accent">*</span>
          </label>
          <input type="text" name="full_name" required placeholder="山田 太郎" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#888888]">
            メールアドレス <span className="text-accent">*</span>
          </label>
          <input type="email" name="email" required placeholder="user@innovation-music.com" className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#888888]">
            パスワード <span className="text-accent">*</span>
          </label>
          <input type="password" name="password" required placeholder="8文字以上" minLength={8} className={inputClass} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#888888]">ロール</label>
          <select name="role" className={inputClass}>
            <option value="editor">編集者</option>
            <option value="admin">管理者</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[#2a2a2a] px-4 py-2 text-sm text-[#888888] hover:border-accent/40 hover:text-white"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-accent py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
          >
            {submitting ? '作成中...' : 'ユーザーを作成'}
          </button>
        </div>
      </form>
    </div>
  )
}
