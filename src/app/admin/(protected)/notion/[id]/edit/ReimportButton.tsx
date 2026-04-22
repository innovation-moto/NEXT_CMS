'use client'

import { useState } from 'react'

interface Props {
  pageId: string
  postId: string
}

export default function ReimportButton({ pageId, postId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleReimport() {
    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch(`/notion-import?page_id=${pageId}`, { method: 'GET' })
      if (res.ok) {
        setStatus('success')
        setMessage('Notionから再インポートしました。ページをリロードしてください。')
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const json = await res.json().catch(() => null)
        setStatus('error')
        setMessage(json?.error ?? '再インポートに失敗しました。')
      }
    } catch {
      setStatus('error')
      setMessage('通信エラーが発生しました。')
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleReimport}
        disabled={status === 'loading'}
        className="w-full rounded-lg border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#888888] transition-colors hover:border-accent/40 hover:text-white disabled:opacity-50"
      >
        {status === 'loading' ? '再インポート中...' : '🔄 Notionから再インポート'}
      </button>
      {status === 'success' && (
        <p className="text-xs text-green-400">✓ {message}</p>
      )}
      {status === 'error' && (
        <p className="text-xs text-red-400">✕ {message}</p>
      )}
    </div>
  )
}
