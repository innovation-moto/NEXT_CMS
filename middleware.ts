import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase auth クッキーの存在でログイン状態を確認
  const isLoggedIn = request.cookies.has('sb-ahukgtwnqscqdofsnwtx-auth-token')

  // /admin/login 以外の管理者ルートは認証必須
  if (!pathname.startsWith('/admin/login')) {
    if (!isLoggedIn) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  // ログイン済みで /admin/login にアクセス → /admin にリダイレクト
  if (pathname === '/admin/login' && isLoggedIn) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // /admin 配下のみに絞ることでEdge環境での誤作動を防ぐ
  matcher: ['/admin/:path*'],
}
