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
      if (!res.ok) throw new Error(data.error ?? '로그인 실패')

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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-slate-800 text-center">로그인</h1>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-600">
            반 코드
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            내 번호
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={studentNumber}
              onChange={(e) => setStudentNumber(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            비밀번호
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow disabled:opacity-50"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </div>
    </main>
  )
}
