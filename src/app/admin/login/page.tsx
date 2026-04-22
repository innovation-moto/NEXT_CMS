'use client'

import { useActionState } from 'react'
import { loginWithOtp } from '@/lib/actions/auth'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(loginWithOtp, null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      {/* Background grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(229,62,62,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(229,62,62,0.08) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <span className="font-display text-base font-bold text-white">IM</span>
            </div>
            <span className="font-display text-xl font-bold text-white">
              Innovation<span className="text-accent">Music</span>
            </span>
          </Link>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-8">
          <h1 className="mb-1 text-2xl font-bold text-white">管理画面</h1>
          <p className="mb-6 text-sm text-[#888888]">メールとパスワードでサインイン</p>

          {state?.error && (
            <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-[#888888]">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white placeholder-[#555] transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-[#888888]">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-2.5 text-sm text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_20px_rgba(229,62,62,0.3)] disabled:opacity-50"
            >
              {isPending ? '送信中...' : '認証コードを送信'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-[#888888] transition-colors hover:text-white">
              ← サイトに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
