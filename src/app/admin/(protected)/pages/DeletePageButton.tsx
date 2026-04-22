'use client'

import { useTransition } from 'react'
import { deletePage } from '@/lib/actions/pages'
import { useRouter } from 'next/navigation'

export default function DeletePageButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('このページを削除しますか？')) return
    startTransition(async () => {
      await deletePage(id)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-[#555] transition-colors hover:text-red-400 disabled:opacity-50"
    >
      {isPending ? '...' : '削除'}
    </button>
  )
}
