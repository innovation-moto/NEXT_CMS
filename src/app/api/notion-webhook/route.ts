import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { importNotionPage } from '@/lib/notion-import'

export const dynamic = 'force-dynamic'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac('sha256', secret)
    hmac.update(rawBody)
    const computed = `sha256=${hmac.digest('hex')}`
    if (computed.length !== signature.length) return false
    return timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Notionがwebhook登録時に送るURLチャレンジに応答
  if (payload.verification_token) {
    return NextResponse.json({ challenge: payload.verification_token })
  }

  // 署名検証
  const secret = process.env.NOTION_WEBHOOK_SECRET
  if (secret) {
    const signature = request.headers.get('x-notion-signature') ?? ''
    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  // ページ以外のイベントはスキップ
  const entity = payload.entity as { type?: string; id?: string } | undefined
  if (entity?.type !== 'page' || !entity?.id) {
    return NextResponse.json({ message: 'skipped' })
  }

  const result = await importNotionPage(entity.id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    action: result.action,
    title: result.title,
    slug: result.slug,
  })
}
