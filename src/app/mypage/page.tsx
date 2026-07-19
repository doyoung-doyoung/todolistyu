'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function MyPage() {
  return (
    <Suspense fallback={null}>
      <MyPageInner />
    </Suspense>
  )
}

function MyPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const isFirst = params.get('first') === '1'

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.loggedIn) router.push('/login')
        else setMe(d.student)
      })
  }, [router])

  async function handleSubmit() {
    setError('')
    if (newPassword.length < 6) {
      setError('새 비밀번호는 6자 이상으로 해주세요')
      return
    }
    if (newPassword !== newPassword2) {
      setError('새 비밀번호가 서로 달라요')
      return
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? '변경 실패')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="text-slate-700 font-medium">비밀번호가 변경됐어요!</p>
          <button
            onClick={() => router.push(me?.role === 'leader' ? '/leader' : '/student')}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow"
          >
            계속하기
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-slate-800 text-center">
          {isFirst ? '처음 로그인이에요, 비밀번호를 바꿔주세요' : '비밀번호 변경'}
        </h1>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-600">
            {isFirst ? '전달받은 임시 비밀번호' : '현재 비밀번호'}
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            새 비밀번호
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-slate-600">
            새 비밀번호 확인
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow"
        >
          비밀번호 바꾸기
        </button>
      </div>
    </main>
  )
}
