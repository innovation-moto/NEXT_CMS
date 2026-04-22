import { NextRequest, NextResponse } from 'next/server'
import { importNotionPage } from '@/lib/notion-import'

// GET /api/notion-import?page_id=NOTION_PAGE_ID&secret=SECRET
// POST /api/notion-import  body: { page_id, secret }
export async function GET(request: NextRequest) {
  return handleImport(request)
}

export async function POST(request: NextRequest) {
  return handleImport(request)
}

async function handleImport(request: NextRequest) {
  const secret = process.env.NOTION_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'NOTION_WEBHOOK_SECRET is not configured' }, { status: 500 })
  }

  let pageId: string | null = null
  let providedSecret: string | null = null

  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url)
    pageId = searchParams.get('page_id')
    providedSecret = searchParams.get('secret')
  } else {
    const body = await request.json().catch(() => null)
    pageId = body?.page_id ?? null
    providedSecret = body?.secret ?? request.headers.get('x-notion-secret')
  }

  if (providedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!pageId) {
    return NextResponse.json({ error: 'page_id is required' }, { status: 400 })
  }

  const result = await importNotionPage(pageId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }

  const { success: _s, ...rest } = result
  return NextResponse.json({ success: true, ...rest })
}
