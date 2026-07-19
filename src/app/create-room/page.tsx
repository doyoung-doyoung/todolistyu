'use client'

import { useState } from 'react'

type RosterEntry = { studentNumber: number; name: string; role: string; tempPassword: string }

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [leaderNumber, setLeaderNumber] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [rosterText, setRosterText] = useState('') // "번호,이름" 한 줄씩
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<RosterEntry[] | null>(null)

  function parseRosterText() {
    return rosterText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [num, ...rest] = line.split(',')
        return { studentNumber: Number(num.trim()), name: rest.join(',').trim() }
      })
      .filter((s) => s.studentNumber && s.name)
  }

  async function handleSubmit() {
    setError('')
    if (!roomName || !classCode || !leaderNumber || !leaderName) {
      setError('빠진 항목이 있어요')
      return
    }
    const students = parseRosterText()

    // 번호 중복 체크 (반장 번호 vs 명단, 명단 내부)
    const allNumbers = [Number(leaderNumber), ...students.map((s) => s.studentNumber)]
    const seen = new Set<number>()
    const duplicates = new Set<number>()
    for (const n of allNumbers) {
      if (seen.has(n)) duplicates.add(n)
      seen.add(n)
    }
    if (duplicates.size > 0) {
      setError(
        `번호가 중복돼요: ${Array.from(duplicates).join(', ')}번. 반장 번호와 학생 명단 번호를 확인해주세요.`
      )
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName,
          classCode,
          leader: { studentNumber: Number(leaderNumber), name: leaderName },
          students,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? '오류가 발생했어요')
      setResult(data.roster)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadCsv() {
    if (!result) return
    const header = '번호,이름,역할,임시비밀번호\n'
    const rows = result
      .map((r) => `${r.studentNumber},${r.name},${r.role === 'leader' ? '반장' : '학생'},${r.tempPassword}`)
      .join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classCode}_로그인정보.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (result) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="text-xl font-bold text-slate-800">반 생성 완료!</h1>
          <p className="text-sm text-slate-500">
            아래 임시 비밀번호는 <b>지금 한 번만</b> 보여드려요. 각 학생에게 직접 전달해주세요.
            학생들은 첫 로그인 후 마이페이지에서 비밀번호를 바꿀 수 있어요.
          </p>
          <button
            onClick={downloadCsv}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow"
          >
            CSV로 다운로드
          </button>
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-2 text-left">번호</th>
                  <th className="p-2 text-left">이름</th>
                  <th className="p-2 text-left">역할</th>
                  <th className="p-2 text-left">임시 비밀번호</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.studentNumber} className="border-t border-slate-100">
                    <td className="p-2">{r.studentNumber}</td>
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.role === 'leader' ? '반장' : '학생'}</td>
                    <td className="p-2 font-mono">{r.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="/login" className="block text-center text-blue-600 font-medium pt-2">
            로그인하러 가기 →
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="text-xl font-bold text-slate-800">반 만들기</h1>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <label className="block text-sm font-medium text-slate-600">
            반 이름
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              placeholder="예: 3학년 2반"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-slate-600">
            반 코드 (학생들이 로그인할 때 입력)
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 p-2"
              placeholder="예: 3-2-2026"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm font-medium text-slate-600">
              반장 번호
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                value={leaderNumber}
                onChange={(e) => setLeaderNumber(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-600">
              반장 이름
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 p-2"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-600">
            나머지 학생 명단 (한 줄에 "번호,이름")
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 font-mono text-sm h-40"
              placeholder={'1,김철수\n2,이영희\n3,박민준\n...'}
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-3 text-white font-semibold shadow disabled:opacity-50"
        >
          {loading ? '생성 중...' : '반 만들고 비밀번호 생성하기'}
        </button>
      </div>
    </main>
  )
}
