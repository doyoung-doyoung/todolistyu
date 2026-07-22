'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABEL: Record<string, string> = {
  homework: 'การบ้าน',
  clothes: 'ชุดที่ต้องใส่',
  supplies: 'อุปกรณ์การเรียน',
  note: 'สมุด',
}

export default function LeaderPage() {
  const router = useRouter()
  const [me, setMe] = useState<any>(null)
  const [roster, setRoster] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [openPostId, setOpenPostId] = useState<number | null>(null)

  const [type, setType] = useState('homework')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [checkerType, setCheckerType] = useState<'leader' | 'self'>('leader')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editType, setEditType] = useState('homework')
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editCheckerType, setEditCheckerType] = useState<'leader' | 'self'>('leader')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<number | null>(null)

  async function load() {
    const meRes = await fetch('/api/auth/me').then((r) => r.json())
    if (!meRes.loggedIn) return router.push('/login')
    if (meRes.student.role !== 'leader') return router.push('/student')
    setMe(meRes.student)

    const rosterRes = await fetch('/api/roster').then((r) => r.json())
    setRoster(rosterRes.roster ?? [])

    const postsRes = await fetch('/api/posts').then((r) => r.json())
    setPosts(postsRes.posts ?? [])
    setChecks(postsRes.checks ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreatePost() {
    if (!title) return
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, title, dueDate: dueDate || null, checkerType }),
    })
    setTitle('')
    setDueDate('')
    load()
  }

  function startEdit(p: any) {
    setEditingId(p.id)
    setEditType(p.type)
    setEditTitle(p.title)
    setEditDueDate(p.due_date ?? '')
    setEditCheckerType(p.checker_type)
    setOpenPostId(null)
  }

  async function saveEdit(postId: number) {
    await fetch('/api/posts/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        type: editType,
        title: editTitle,
        dueDate: editDueDate || null,
        checkerType: editCheckerType,
      }),
    })
    setEditingId(null)
    load()
  }

  async function handleDeletePost(postId: number) {
    await fetch('/api/posts/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId }),
    })
    setConfirmingDeleteId(null)
    load()
  }

  async function toggleCheck(postId: number, studentId: number) {
    await fetch('/api/checks/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, studentId }),
    })
    load()
  }

  function checksFor(postId: number) {
    return checks.filter((c) => c.post_id === postId)
  }

  function isChecked(postId: number, studentId: number) {
    return checksFor(postId).find((c) => c.student_id === studentId)?.checked ?? false
  }

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-lg font-bold">แดชบอร์ดหัวหน้าห้อง</h1>
          <a href="/mypage" className="text-sm text-[var(--accent-cyan)]">
            โปรไฟล์ของฉัน
          </a>
        </div>

        <div className="glass-card p-4 space-y-2">
          <p className="text-sm font-semibold text-[var(--text-muted)]">เพิ่มรายการใหม่</p>
          <div className="flex gap-2">
            <select
              className="glass-input p-2 text-sm flex-1"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="homework">การบ้าน</option>
              <option value="clothes">ชุดที่ต้องใส่</option>
              <option value="supplies">อุปกรณ์การเรียน</option>
              <option value="note">สมุด</option>
            </select>
            <select
              className="glass-input p-2 text-sm flex-1"
              value={checkerType}
              onChange={(e) => setCheckerType(e.target.value as any)}
            >
              <option value="leader">หัวหน้าห้องเช็ค</option>
              <option value="self">นักเรียนเช็คเอง</option>
            </select>
          </div>
          <input
            className="w-full glass-input p-2.5 text-sm"
            placeholder="เช่น แบบฝึกหัดคณิตศาสตร์ หน้า 32"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            className="w-full glass-input p-2.5 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button onClick={handleCreatePost} className="btn-neon w-full py-2.5 text-sm">
            เพิ่มรายการ
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((p) => {
            const postChecks = checksFor(p.id)
            const doneCount = postChecks.filter((c) => c.checked).length
            const total = roster.length || 1
            const pct = Math.round((doneCount / total) * 100)
            const isOpen = openPostId === p.id
            const isEditing = editingId === p.id

            if (isEditing) {
              return (
                <div key={p.id} className="glass-card p-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      className="glass-input p-2 text-sm flex-1"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="homework">การบ้าน</option>
                      <option value="clothes">ชุดที่ต้องใส่</option>
                      <option value="supplies">อุปกรณ์การเรียน</option>
                      <option value="note">สมุด</option>
                    </select>
                    <select
                      className="glass-input p-2 text-sm flex-1"
                      value={editCheckerType}
                      onChange={(e) => setEditCheckerType(e.target.value as any)}
                    >
                      <option value="leader">หัวหน้าห้องเช็ค</option>
                      <option value="self">นักเรียนเช็คเอง</option>
                    </select>
                  </div>
                  <input
                    className="w-full glass-input p-2.5 text-sm"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                  <input
                    type="date"
                    className="w-full glass-input p-2.5 text-sm"
                    value={editDueDate ?? ''}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="btn-neon flex-1 py-2 text-sm">
                      บันทึก
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost flex-1 py-2 text-sm">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={p.id} className="glass-card overflow-hidden">
                <div className="w-full flex items-center justify-between p-3">
                  <button
                    className="flex-1 text-left"
                    onClick={() => setOpenPostId(isOpen ? null : p.id)}
                  >
                    <span className="pill pill-type mr-2">{TYPE_LABEL[p.type] ?? p.type}</span>
                    <span className="font-medium">{p.title}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="neon-progress-track flex-1 max-w-[120px]">
                        <div className="neon-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-[var(--text-muted)] mono">
                        {doneCount}/{roster.length} คน
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-3 pl-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-xs text-[var(--accent-cyan)]"
                      title="แก้ไข"
                    >
                      แก้ไข
                    </button>
                    {confirmingDeleteId === p.id ? (
                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="pill pill-danger"
                        >
                          ลบ
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="text-xs text-[var(--text-muted)]"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeleteId(p.id)}
                        className="text-xs text-[var(--accent-red)]"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-white/10 p-3 grid grid-cols-4 gap-2">
                    {roster.map((s) => {
                      const checked = isChecked(p.id, s.id)
                      const disabled = p.checker_type !== 'leader'
                      return (
                        <button
                          key={s.id}
                          disabled={disabled}
                          onClick={() => toggleCheck(p.id, s.id)}
                          className={`pill text-xs font-medium ${checked ? 'pill-done' : 'pill-pending'} ${
                            disabled ? 'opacity-50' : ''
                          }`}
                        >
                          {s.student_number}. {s.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
