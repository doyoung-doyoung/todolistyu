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
      setError('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    if (newPassword !== newPassword2) {
      setError('รหัสผ่านใหม่ไม่ตรงกัน')
      return
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <p className="font-medium text-[var(--accent-cyan)]">เปลี่ยนรหัสผ่านสำเร็จแล้ว!</p>
          <button
            onClick={() => router.push(me?.role === 'leader' ? '/leader' : '/student')}
            className="btn-neon w-full py-3"
          >
            ดำเนินการต่อ
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="font-display text-xl font-bold text-center">
          {isFirst ? 'เข้าสู่ระบบครั้งแรก กรุณาเปลี่ยนรหัสผ่าน' : 'เปลี่ยนรหัสผ่าน'}
        </h1>

        <div className="space-y-3 glass-card p-4">
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            {isFirst ? 'รหัสผ่านชั่วคราวที่ได้รับ' : 'รหัสผ่านปัจจุบัน'}
            <input
              type="password"
              className="mt-1 w-full glass-input p-2.5"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            รหัสผ่านใหม่
            <input
              type="password"
              className="mt-1 w-full glass-input p-2.5"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            ยืนยันรหัสผ่านใหม่
            <input
              type="password"
              className="mt-1 w-full glass-input p-2.5"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-sm text-[var(--accent-red)]">{error}</p>}

        <button onClick={handleSubmit} className="btn-neon w-full py-3.5">
          เปลี่ยนรหัสผ่าน
        </button>
      </div>
    </main>
  )
}
