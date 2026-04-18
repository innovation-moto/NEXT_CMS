'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface User {
  email: string
  full_name: string | null
  role: string
  avatar_url: string | null
}

interface Props {
  user: User
}

export default function AdminTopBar({ user }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const displayName = user.full_name ?? user.email.split('@')[0]
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#1a1a28] bg-[#0d0d14] px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-medium text-[#888888]">
          Innovation Music CMS
        </h1>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[#1a1a28]"
          aria-expanded={dropdownOpen}
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-xs font-medium text-white">{displayName}</p>
            <p className="text-xs text-[#888888]">{user.role === 'admin' ? '管理者' : '編集者'}</p>
          </div>
          <span className="text-xs text-[#888888]">▾</span>
        </button>

        {/* Dropdown */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-[#2a2a2a] bg-[#111118] py-1 shadow-xl">
              <p className="px-4 py-2 text-xs text-[#888888]">{user.email}</p>
              <hr className="border-[#2a2a2a]" />
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-[#888888] transition-colors hover:bg-[#1a1a28] hover:text-red-400"
              >
                ログアウト
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
