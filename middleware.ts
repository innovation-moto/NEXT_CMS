import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Supabase session クッキーの存在でログイン状態を確認
  const isLoggedIn = request.cookies.getAll().some(
    (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  )

  // 2FA pending クッキー（パスワード認証済み・OTP未検証）
  const is2faPending = request.cookies.has('admin_2fa_pending')

  const isLoginPage = pathname === '/admin/login'
  const is2faPage = pathname === '/admin/verify-2fa'

  // ログインページ: ログイン済み & 2FA完了済み → /admin へ
  if (isLoginPage) {
    if (isLoggedIn && !is2faPending) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // 2FAページ: 未ログイン → /admin/login へ
  if (is2faPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  }

  // その他の管理画面: 未ログイン → /admin/login へ
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // ログイン済みだが 2FA 未完了 → /admin/verify-2fa へ
  if (is2faPending) {
    return NextResponse.redirect(new URL('/admin/verify-2fa', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin(.*)'],
}
