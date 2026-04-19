import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase auth クッキーの存在でログイン状態を確認
  const isLoggedIn = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  // 管理者ルートの保護（/admin/login 以外）
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!isLoggedIn) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      redirectUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // ログイン済みなら /admin/login → /admin にリダイレクト
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // レイアウトがパスを判断できるようにリクエストヘッダーで渡す
  // ※ response.headers ではなく request.headers に設定しないと
  //    サーバーコンポーネントの headers() で読めない
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', pathname)
  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
