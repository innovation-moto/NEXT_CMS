import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token')
  const secret = process.env.REVALIDATE_SECRET

  if (!secret || token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const path = body?.path as string | undefined

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  // Revalidate all public pages
  revalidatePath('/')
  revalidatePath('/news')
  revalidatePath('/blog')

  return NextResponse.json({ revalidated: true, paths: ['/', '/news', '/blog'] })
}
