'use client'

import { useRef, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { verifyOtp } from '@/lib/actions/auth'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent/80 hover:shadow-[0_0_20px_rgba(229,62,62,0.3)] disabled:opacity-50"
    >
      {pending ? '確認中...' : '確認する'}
    </button>
  )
}

export default function Verify2FAPage() {
  const [state, action] = useFormState(verifyOtp, null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // 各桁の入力フィールドを自動フォーカス
  function handleDigitInput(index: number, value: string) {
    if (value.length === 6) {
      // ペーストで6桁全部入ったとき
      value.split('').forEach((char, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i]!.value = char
        }
      })
      inputRefs.current[5]?.focus()
      return
    }
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // フォームのhidden inputに6桁をまとめる
  function getCode() {
    return inputRefs.current.map((el) => el?.value ?? '').join('')
  }

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
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
          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="mb-1 text-2xl font-bold text-white">2段階認証</h1>
          <p className="mb-6 text-sm text-[#888888]">
            メールに送信された6桁のコードを入力してください
          </p>

          {state?.error && (
            <div className="mb-4 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <form
            action={(formData) => {
              formData.set('code', getCode())
              action(formData)
            }}
            className="space-y-6"
          >
            {/* 6桁入力 */}
            <div>
              <label className="mb-3 block text-xs font-medium text-[#888888]">認証コード</label>
              <div className="flex gap-2 justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    className="h-14 w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] text-center text-xl font-bold text-white focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '')
                      e.target.value = val.slice(-1)
                      handleDigitInput(i, val)
                    }}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={(e) => {
                      e.preventDefault()
                      const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '')
                      if (pasted.length === 6) {
                        pasted.split('').forEach((char, idx) => {
                          if (inputRefs.current[idx]) inputRefs.current[idx]!.value = char
                        })
                        inputRefs.current[5]?.focus()
                      }
                    }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-[#555]">有効期限: 10分間</p>
            </div>

            <SubmitButton />
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="text-xs text-[#888888] transition-colors hover:text-white"
            >
              ← ログイン画面に戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
