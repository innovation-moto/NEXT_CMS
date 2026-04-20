import { adminSupabase } from '@/lib/supabase/admin'
import { formatDate, formatFileSize } from '@/lib/utils'
import Image from 'next/image'
import MediaUploadButton from './MediaUploadButton'
import CopyUrlButton from './CopyUrlButton'
import type { Media } from '@/types/supabase'

export default async function AdminMediaPage() {
  const { data, error } = await adminSupabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
  const mediaItems = data as Media[] | null

  // テーブルが存在しない場合のフォールバック
  if (error) {
    console.error('Media fetch error:', error.message)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">メディアライブラリ</h1>
          <p className="text-sm text-[#888888]">{mediaItems?.length ?? 0} 件のファイル</p>
        </div>
        <MediaUploadButton />
      </div>

      {mediaItems && mediaItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="group overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#111118]"
            >
              {/* Preview */}
              <div className="relative aspect-square overflow-hidden bg-[#1a1a28]">
                <Image
                  src={item.url}
                  alt={item.filename}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                {/* Copy URL overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <CopyUrlButton url={item.url} />
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="truncate text-xs font-medium text-white">{item.filename}</p>
                <p className="text-xs text-[#888888]">{formatFileSize(item.size)}</p>
                <p className="text-xs text-[#555]">{formatDate(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] py-20 text-center">
          <span className="mb-3 text-4xl">🖼️</span>
          <p className="text-sm text-[#888888]">まだファイルがありません。</p>
          <p className="text-xs text-[#555]">上のボタンからアップロードしてください。</p>
        </div>
      )}
    </div>
  )
}
