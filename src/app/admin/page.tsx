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
        <h1 className="font-display text-lg font-bold">ผู้ดูแลระบบ · ห้องเรียนทั้งหมด</h1>

        {loading && <p className="text-sm text-[var(--text-muted)]">กำลังโหลด...</p>}
        {!loading && rooms.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">ยังไม่มีห้องเรียนที่สร้างไว้</p>
        )}

        <div className="space-y-2">
          {rooms.map((r) => (
            <div key={r.id} className="glass-card p-4 flex items-center justify-between">
              <a href={`/admin/rooms/${r.id}`} className="flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mono">
                  รหัส {r.class_code} · นักเรียน {r.studentCount} คน · รายการ {r.postCount} รายการ · แตะเพื่อจัดการ
                </p>
              </a>

              {confirmingId === r.id ? (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-[var(--accent-red)]">ลบห้องนี้จริงไหม?</span>
                  <button onClick={() => handleDelete(r.id)} className="pill pill-danger">
                    ลบ
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="text-xs text-[var(--text-muted)]"
                  >
                    ยกเลิก
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(r.id)}
                  className="text-xs text-[var(--accent-red)]"
                >
                  ลบห้องเรียน
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
