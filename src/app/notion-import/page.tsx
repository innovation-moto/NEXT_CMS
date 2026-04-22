import { importNotionPage } from '@/lib/notion-import'

// キャッシュを無効化してリクエストごとに必ずインポート処理を実行する
export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page_id?: string }>
}

export default async function NotionImportPage({ searchParams }: Props) {
  const { page_id } = await searchParams

  if (!page_id) {
    return <Layout><ErrorCard title="パラメータエラー" message="page_id が指定されていません。" /></Layout>
  }

  // ── インポート実行 ────────────────────────────────────────────────────────
  const result = await importNotionPage(page_id)

  if (!result.success) {
    return <Layout><ErrorCard title="インポート失敗" message={result.error} /></Layout>
  }

  return (
    <Layout>
      <SuccessCard
        action={result.action}
        title={result.title}
        slug={result.slug}
        type={result.type}
        status={result.status}
        postId={result.postId}
        pageId={page_id}
      />
    </Layout>
  )
}

// ─── Layout ──────────────────────────────────────────────────────────────────

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '2rem',
    }}>
      {children}
    </div>
  )
}

// ─── Success Card ─────────────────────────────────────────────────────────────

function SuccessCard({ action, title, slug, type, status, postId, pageId }: {
  action: 'created' | 'updated'
  title: string
  slug: string
  type: string
  status: string
  postId: string
  pageId: string
}) {
  const isCreated = action === 'created'
  const statusLabel: Record<string, string> = { draft: '下書き', published: '公開', archived: 'アーカイブ' }
  const typeLabel: Record<string, string> = { blog: 'ブログ', news: 'ニュース' }

  return (
    <div style={{
      background: '#111111',
      border: '1px solid #2a2a2a',
      borderRadius: '0.75rem',
      padding: '2.5rem',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      {/* アイコン */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(229,62,62,0.15)',
          border: '2px solid #e53e3e',
          fontSize: '2rem',
        }}>
          ✓
        </div>
      </div>

      {/* タイトル */}
      <h1 style={{ color: '#e8e8e8', fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.5rem' }}>
        インポート{isCreated ? '完了' : '更新完了'}
      </h1>
      <p style={{ color: '#888888', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 2rem' }}>
        Notionページを{isCreated ? '新規作成' : '更新'}しました
      </p>

      {/* 詳細 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Row label="タイトル" value={title} />
        <Row label="スラッグ" value={slug} mono />
        <Row label="種別" value={typeLabel[type] ?? type} />
        <Row label="ステータス" value={statusLabel[status] ?? status} badge={status} />
      </div>

      {/* リンク */}
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <a
          href={`/admin/posts/${postId}/edit`}
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #e53e3e, #fc8181)',
            color: '#fff',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          CMS編集画面で開く
        </a>
        <a
          href={`https://www.notion.so/${pageId.replace(/-/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'transparent',
            color: '#888888',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontSize: '0.875rem',
            border: '1px solid #2a2a2a',
          }}
        >
          Notionページを開く
        </a>
      </div>
    </div>
  )
}

// ─── Error Card ───────────────────────────────────────────────────────────────

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <div style={{
      background: '#111111',
      border: '1px solid #3a1a1a',
      borderRadius: '0.75rem',
      padding: '2.5rem',
      maxWidth: '480px',
      width: '100%',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(229,62,62,0.1)',
          border: '2px solid #9b2c2c',
          fontSize: '2rem',
        }}>
          ✕
        </div>
      </div>
      <h1 style={{ color: '#e8e8e8', fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', margin: '0 0 0.75rem' }}>
        {title}
      </h1>
      <p style={{ color: '#888888', fontSize: '0.875rem', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
        {message}
      </p>
    </div>
  )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function Row({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: string }) {
  const badgeColor: Record<string, string> = {
    published: '#276749',
    draft: '#4a4a4a',
    archived: '#7b341e',
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.625rem 0.75rem',
      background: '#1a1a1a',
      borderRadius: '0.375rem',
      gap: '1rem',
    }}>
      <span style={{ color: '#888888', fontSize: '0.8125rem', flexShrink: 0 }}>{label}</span>
      {badge ? (
        <span style={{
          background: badgeColor[badge] ?? '#4a4a4a',
          color: '#e8e8e8',
          fontSize: '0.75rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '9999px',
          fontWeight: 600,
        }}>
          {value}
        </span>
      ) : (
        <span style={{
          color: '#e8e8e8',
          fontSize: '0.8125rem',
          fontFamily: mono ? 'monospace' : 'inherit',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
      )}
    </div>
  )
}
