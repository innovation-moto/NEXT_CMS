import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付を日本語フォーマットで表示
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'yyyy年M月d日', { locale: ja })
  } catch {
    return '—'
  }
}

/**
 * 相対時間を表示（例: "3日前"）
 */
export function formatRelativeDate(dateString: string | null | undefined): string {
  if (!dateString) return '—'
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja })
  } catch {
    return '—'
  }
}

/**
 * ファイルサイズをヒューマンリーダブルに変換
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * ステータスの表示ラベルを返す
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    published: '公開中',
    draft: '下書き',
    archived: 'アーカイブ',
  }
  return labels[status] ?? status
}

/**
 * 投稿タイプの表示ラベルを返す
 */
export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    blog: 'ブログ',
    news: 'ニュース',
  }
  return labels[type] ?? type
}

/**
 * HTMLタグを除去してプレーンテキストに変換
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * テキストを指定文字数で切り詰める
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * クラス名を結合するユーティリティ
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
