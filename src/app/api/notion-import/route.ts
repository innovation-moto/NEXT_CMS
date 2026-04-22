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
  let pageId: string | null = null

  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url)
    pageId = searchParams.get('page_id')
  } else {
    const body = await request.json().catch(() => null)
    pageId = body?.page_id ?? null
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
