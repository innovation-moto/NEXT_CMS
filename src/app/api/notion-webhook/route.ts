import { NextRequest, NextResponse } from 'next/server'
import { importNotionPage } from '@/lib/notion-import'

export const dynamic = 'force-dynamic'

function extractPageId(payload: Record<string, unknown>): string | null {
  // Notion Automations形式: { data: { id: "..." } }
  const data = payload.data as Record<string, unknown> | undefined
  if (typeof data?.id === 'string') return data.id

  // Notion APIイベント形式: { entity: { type: "page", id: "..." } }
  const entity = payload.entity as Record<string, unknown> | undefined
  if (entity?.type === 'page' && typeof entity?.id === 'string') return entity.id

  // ルートにidがある場合: { id: "...", object: "page" }
  if (payload.object === 'page' && typeof payload.id === 'string') return payload.id

  return null
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Notion URLチャレンジ応答
  if (payload.verification_token) {
    return NextResponse.json({ challenge: payload.verification_token })
  }

  const pageId = extractPageId(payload)
  if (!pageId) {
    return NextResponse.json({ message: 'page_id not found', payload }, { status: 200 })
  }

  const result = await importNotionPage(pageId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    action: result.action,
    title: result.title,
    slug: result.slug,
  })
}
