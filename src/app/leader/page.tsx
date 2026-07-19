'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABEL: Record<string, string> = {
  homework: '숙제',
  clothes: '입을 옷',
  supplies: '준비물',
  note: '노트',
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
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">반장 대시보드</h1>
          <a href="/mypage" className="text-sm text-blue-600">
            마이페이지
          </a>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700">새 항목 등록</p>
          <div className="flex gap-2">
            <select
              className="rounded-lg border border-slate-300 p-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="homework">숙제</option>
              <option value="clothes">입을 옷</option>
              <option value="supplies">준비물</option>
              <option value="note">노트</option>
            </select>
            <select
              className="rounded-lg border border-slate-300 p-2 text-sm"
              value={checkerType}
              onChange={(e) => setCheckerType(e.target.value as any)}
            >
              <option value="leader">반장이 체크</option>
              <option value="self">학생 본인이 체크</option>
            </select>
          </div>
          <input
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            placeholder="예: 수학 익힘책 32쪽"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 p-2 text-sm"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button
            onClick={handleCreatePost}
            className="w-full rounded-lg bg-blue-600 py-2 text-white text-sm font-semibold"
          >
            등록하기
          </button>
        </div>

        <div className="space-y-3">
          {posts.map((p) => {
            const postChecks = checksFor(p.id)
            const doneCount = postChecks.filter((c) => c.checked).length
            const isOpen = openPostId === p.id
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 text-left"
                  onClick={() => setOpenPostId(isOpen ? null : p.id)}
                >
                  <div>
                    <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 mr-2">
                      {TYPE_LABEL[p.type] ?? p.type}
                    </span>
                    <span className="font-medium text-slate-800">{p.title}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {doneCount}/{roster.length}명
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 p-3 grid grid-cols-4 gap-2">
                    {roster.map((s) => {
                      const checked = isChecked(p.id, s.id)
                      const disabled = p.checker_type !== 'leader' // 반장이 체크하는 항목만 여기서 누를 수 있음
                      return (
                        <button
                          key={s.id}
                          disabled={disabled}
                          onClick={() => toggleCheck(p.id, s.id)}
                          className={`rounded-lg p-2 text-xs font-medium border ${
                            checked
                              ? 'bg-green-100 border-green-300 text-green-700'
                              : 'bg-slate-50 border-slate-200 text-slate-500'
                          } ${disabled ? 'opacity-50' : ''}`}
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
