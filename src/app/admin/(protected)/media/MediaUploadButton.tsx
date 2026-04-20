'use client'

import { useRef, useState } from 'react'
import { uploadImage } from '@/lib/actions/media'
import { useRouter } from 'next/navigation'

export default function MediaUploadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    const file = files[0]
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)

    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-xs text-red-400">{error}</p>
      )}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/80 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            アップロード中...
          </>
        ) : (
          '+ アップロード'
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />
    </div>
  )
}
