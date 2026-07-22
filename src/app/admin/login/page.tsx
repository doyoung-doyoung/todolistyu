'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '로그인 실패')
      return
    }
    router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-xl font-bold text-center">관리자 로그인</h1>
        <div className="space-y-3 glass-card p-4">
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            관리자 비밀번호
            <input
              type="password"
              className="mt-1 w-full glass-input p-2.5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </label>
        </div>
        {error && <p className="text-sm text-[var(--accent-red)]">{error}</p>}
        <button onClick={handleLogin} className="btn-neon w-full py-3">
          로그인
        </button>
      </div>
    </main>
  )
}
