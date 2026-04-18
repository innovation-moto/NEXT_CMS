'use client'

import { useState } from 'react'
import { toggleMessageRead } from '@/lib/actions/contact'

interface Props {
  messageId: string
  isRead: boolean
}

export default function MarkReadButton({ messageId, isRead }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleMessageRead(messageId, isRead)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`text-xs transition-colors disabled:opacity-50 ${
        isRead
          ? 'text-[#555] hover:text-[#888888]'
          : 'text-accent hover:text-accent/70'
      }`}
    >
      {loading ? '...' : isRead ? '未読にする' : '既読にする'}
    </button>
  )
}
