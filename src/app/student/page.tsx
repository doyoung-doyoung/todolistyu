'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABEL: Record<string, string> = {
  homework: 'การบ้าน',
  clothes: 'ชุดที่ต้องใส่',
  supplies: 'อุปกรณ์การเรียน',
  note: 'สมุด',
}

export default function StudentPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])

  async function load() {
    const meRes = await fetch('/api/auth/me').then((r) => r.json())
    if (!meRes.loggedIn) return router.push('/login')
    setMe(meRes.student)

    const postsRes = await fetch('/api/posts').then((r) => r.json())
    setPosts(postsRes.posts ?? [])
    setChecks(postsRes.checks ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  function myCheck(postId: number) {
    return checks.find((c) => c.post_id === postId && c.student_id === me?.id)
  }

  async function toggleSelf(postId: number) {
    await fetch('/api/checks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, studentId: me.id }),
    })
    load()
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold">
            สวัสดี {me?.name} <span className="text-[var(--accent-cyan)]">👋</span>
          </h1>
          <a href="/mypage" className="text-sm text-[var(--accent-cyan)]">
            โปรไฟล์ของฉัน
          </a>
        </div>
        <p className="text-sm text-[var(--text-muted)] -mt-2">นี่คือสิ่งที่ต้องทำวันนี้</p>

        <div className="space-y-3">
          {posts.length === 0 && <p className="text-sm text-[var(--text-muted)]">ยังไม่มีรายการ</p>}
          {posts.map((p) => {
            const c = myCheck(p.id)
            const checked = c?.checked ?? false
            const selfCheckable = p.checker_type === 'self'

            return (
              <div key={p.id} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <span className="pill pill-type mr-2">{TYPE_LABEL[p.type] ?? p.type}</span>
                  <span className="font-medium">{p.title}</span>
                  {p.due_date && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 mono">กำหนดส่ง {p.due_date}</p>
                  )}
                </div>

                {selfCheckable ? (
                  <button
                    onClick={() => toggleSelf(p.id)}
                    className={`pill font-semibold ${checked ? 'pill-done' : 'pill-pending'}`}
                  >
                    {checked ? 'เช็คแล้ว' : 'เช็คเลย'}
                  </button>
                ) : (
                  <span className={`pill ${checked ? 'pill-done' : 'pill-pending'}`}>
                    {checked ? 'หัวหน้าห้องเช็คแล้ว' : 'รอหัวหน้าห้องเช็ค'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
