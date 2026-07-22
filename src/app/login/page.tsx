'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [classCode, setClassCode] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode, studentNumber: Number(studentNumber), password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'เข้าสู่ระบบไม่สำเร็จ')

      if (data.mustChangePassword) {
        router.push('/mypage?first=1')
      } else if (data.role === 'leader') {
        router.push('/leader')
      } else {
        router.push('/student')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-xl font-bold text-center">เข้าสู่ระบบ</h1>

        <div className="space-y-3 glass-card p-4">
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            รหัสห้อง
            <input
              className="mt-1 w-full glass-input p-2.5"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            เลขที่ของฉัน
            <input
              type="number"
              className="mt-1 w-full glass-input p-2.5"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            รหัสผ่าน
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

        <button onClick={handleLogin} disabled={loading} className="btn-neon w-full py-3.5">
          {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </button>
      </div>
    </main>
  )
}
