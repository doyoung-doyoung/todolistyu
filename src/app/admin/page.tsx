'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Room = {
  id: number
  name: string
  class_code: string
  created_at: string
  studentCount: number
  postCount: number
}

export default function AdminPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [confirmingId, setConfirmingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/rooms')
    if (res.status === 403) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setRooms(data.rooms ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDelete(roomId: number) {
    await fetch('/api/admin/rooms/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId }),
    })
    setConfirmingId(null)
    load()
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="font-display text-lg font-bold">관리자 · 전체 반 목록</h1>

        {loading && <p className="text-sm text-[var(--text-muted)]">불러오는 중...</p>}
        {!loading && rooms.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">생성된 반이 없어요</p>
        )}

        <div className="space-y-2">
          {rooms.map((r) => (
            <div key={r.id} className="glass-card p-4 flex items-center justify-between">
              <a href={`/admin/rooms/${r.id}`} className="flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mono">
                  코드 {r.class_code} · 학생 {r.studentCount}명 · 항목 {r.postCount}개 · 관리하려면 탭
                </p>
              </a>

              {confirmingId === r.id ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-[var(--accent-red)]">정말 삭제할까요?</span>
                  <button onClick={() => handleDelete(r.id)} className="pill pill-danger">
                    삭제
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="text-xs text-[var(--text-muted)]"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(r.id)}
                  className="text-xs text-[var(--accent-red)]"
                >
                  반 삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
