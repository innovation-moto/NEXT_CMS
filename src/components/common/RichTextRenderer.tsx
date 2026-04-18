'use client'

import { useEffect, useState } from 'react'

interface Props {
  content: string | null | undefined
}

const ALLOWED_TAGS = [
  'p', 'h2', 'h3', 'h4',
  'strong', 'em', 'u', 's',
  'ul', 'ol', 'li',
  'blockquote', 'hr', 'br',
  'img', 'a',
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title',
  'target', 'rel', 'class',
]

export default function RichTextRenderer({ content }: Props) {
  const [sanitized, setSanitized] = useState('')

  useEffect(() => {
    if (!content) return

    // DOMPurifyはブラウザ専用のため動的インポート
    import('dompurify').then(({ default: DOMPurify }) => {
      const clean = DOMPurify.sanitize(content, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        ADD_ATTR: ['target'],
      })
      setSanitized(clean)
    })
  }, [content])

  if (!content) {
    return <p className="text-[#888888]">コンテンツはまだありません。</p>
  }

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
