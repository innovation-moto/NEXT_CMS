'use client'

import { useState } from 'react'
import { deletePost } from '@/lib/actions/posts'
import { useRouter } from 'next/navigation'

interface Props {
  postId: string
  postTitle: string
}

export default function DeletePostButton({ postId, postTitle }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    const result = await deletePost(postId)
    if (result.success) {
      router.refresh()
    }
    setDeleting(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? '削除中...' : '確認'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#888888] hover:text-white"
        >
          取消
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#888888] hover:text-red-400 transition-colors"
      title={`「${postTitle}」を削除`}
    >
      削除
    </button>
  )
}
