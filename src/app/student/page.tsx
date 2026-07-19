'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABEL: Record<string, string> = {
  homework: '숙제',
  clothes: '입을 옷',
  supplies: '준비물',
  note: '노트',
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
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">{me?.name}님, 오늘의 할 일</h1>
          <a href="/mypage" className="text-sm text-blue-600">
            마이페이지
          </a>
        </div>

        <div className="space-y-3">
          {posts.length === 0 && <p className="text-sm text-slate-400">등록된 항목이 없어요</p>}
          {posts.map((p) => {
            const c = myCheck(p.id)
            const checked = c?.checked ?? false
            const selfCheckable = p.checker_type === 'self'

            return (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-600 mr-2">
                    {TYPE_LABEL[p.type] ?? p.type}
                  </span>
                  <span className="font-medium text-slate-800">{p.title}</span>
                  {p.due_date && <p className="text-xs text-slate-400 mt-1">마감 {p.due_date}</p>}
                </div>

                {selfCheckable ? (
                  <button
                    onClick={() => toggleSelf(p.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
                      checked
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    {checked ? '확인함' : '확인하기'}
                  </button>
                ) : (
                  <span
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${
                      checked ? 'text-green-700' : 'text-slate-400'
                    }`}
                  >
                    {checked ? '제출 확인됨' : '반장 확인 대기'}
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
