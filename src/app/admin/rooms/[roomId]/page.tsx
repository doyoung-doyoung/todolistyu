'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

const TYPE_LABEL: Record<string, string> = {
  homework: 'การบ้าน',
  clothes: 'ชุดที่ต้องใส่',
  supplies: 'อุปกรณ์การเรียน',
  note: 'สมุด',
}

type Student = { id: number; student_number: number; name: string; role: string }
type Post = { id: number; type: string; title: string; due_date: string | null; checker_type: string }
type Room = { id: number; name: string; class_code: string }

export default function AdminRoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roomId = Number(params.roomId)

  const [room, setRoom] = useState<Room | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newNumber, setNewNumber] = useState('')
  const [newName, setNewName] = useState('')
  const [addedPassword, setAddedPassword] = useState<{ name: string; password: string } | null>(null)

  const [confirmingStudentId, setConfirmingStudentId] = useState<number | null>(null)
  const [confirmingPostId, setConfirmingPostId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/rooms/detail?roomId=${roomId}`)
    if (res.status === 403) {
      router.push('/admin/login')
      return
    }
    const data = await res.json()
    setRoom(data.room)
    setStudents(data.students ?? [])
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  async function handleAddStudent() {
    setError('')
    if (!newNumber || !newName) {
      setError('กรุณากรอกเลขที่และชื่อ')
      return
    }
    const res = await fetch('/api/admin/students/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, studentNumber: Number(newNumber), name: newName }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'เพิ่มไม่สำเร็จ')
      return
    }
    setAddedPassword({ name: newName, password: data.tempPassword })
    setNewNumber('')
    setNewName('')
    load()
  }

  async function handleDeleteStudent(studentId: number) {
    setError('')
    const res = await fetch('/api/admin/students/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'ลบไม่สำเร็จ')
      setConfirmingStudentId(null)
      return
    }
    setConfirmingStudentId(null)
    load()
  }

  async function handleDeletePost(postId: number) {
    await fetch('/api/admin/posts/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    setConfirmingPostId(null)
    load()
  }

  if (loading) {
    return <main className="min-h-screen p-4 text-sm text-[var(--text-muted)]">กำลังโหลด...</main>
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <a href="/admin" className="text-sm text-[var(--accent-cyan)]">
            ← ห้องเรียนทั้งหมด
          </a>
          <h1 className="font-display text-lg font-bold mt-1">
            {room?.name}{' '}
            <span className="text-sm font-normal text-[var(--text-muted)] mono">รหัส {room?.class_code}</span>
          </h1>
        </div>

        {/* จัดการนักเรียน */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-muted)]">
            รายชื่อนักเรียน ({students.length} คน)
          </h2>

          <div className="glass-card divide-y divide-white/10">
            {students.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3">
                <span className="text-sm">
                  {s.student_number}. {s.name}
                  {s.role === 'leader' && <span className="pill pill-type ml-2">หัวหน้าห้อง</span>}
                </span>

                {confirmingStudentId === s.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-[var(--accent-red)]">ลบใช่ไหม?</span>
                    <button onClick={() => handleDeleteStudent(s.id)} className="pill pill-danger">
                      ลบ
                    </button>
                    <button
                      onClick={() => setConfirmingStudentId(null)}
                      className="text-xs text-[var(--text-muted)]"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingStudentId(s.id)} className="text-xs text-[var(--accent-red)]">
                    ลบ
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="glass-card p-3 space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)]">เพิ่มนักเรียน</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="เลขที่"
                className="w-20 glass-input p-2 text-sm"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
              />
              <input
                placeholder="ชื่อ"
                className="flex-1 glass-input p-2 text-sm"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button onClick={handleAddStudent} className="btn-neon px-3 py-2 text-sm">
                เพิ่ม
              </button>
            </div>
            {error && <p className="text-xs text-[var(--accent-red)]">{error}</p>}
            {addedPassword && (
              <p className="text-xs text-[var(--text-muted)] bg-white/5 rounded-lg p-2">
                รหัสผ่านชั่วคราวของ {addedPassword.name}:{' '}
                <span className="mono font-semibold text-[var(--accent-cyan)]">{addedPassword.password}</span>
                <br />
                (แสดงครั้งเดียวตรงนี้ กรุณาส่งให้นักเรียนโดยตรง)
              </p>
            )}
          </div>
        </section>

        {/* จัดการรายการ */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--text-muted)]">
            รายการที่ลงทะเบียน ({posts.length} รายการ)
          </h2>
          <div className="glass-card divide-y divide-white/10">
            {posts.length === 0 && (
              <p className="p-3 text-sm text-[var(--text-muted)]">ยังไม่มีรายการ</p>
            )}
            {posts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3">
                <span className="text-sm">
                  <span className="pill pill-type mr-2">{TYPE_LABEL[p.type] ?? p.type}</span>
                  {p.title}
                </span>

                {confirmingPostId === p.id ? (
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-[var(--accent-red)]">ลบใช่ไหม?</span>
                    <button onClick={() => handleDeletePost(p.id)} className="pill pill-danger">
                      ลบ
                    </button>
                    <button
                      onClick={() => setConfirmingPostId(null)}
                      className="text-xs text-[var(--text-muted)]"
                    >
                      ยกเลิก
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingPostId(p.id)} className="text-xs text-[var(--accent-red)]">
                    ลบ
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
