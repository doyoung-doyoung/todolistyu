'use client'

import { useState } from 'react'

type RosterEntry = { studentNumber: number; name: string; role: string; tempPassword: string }

export default function CreateRoomPage() {
  const [roomName, setRoomName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [leaderNumber, setLeaderNumber] = useState('')
  const [leaderName, setLeaderName] = useState('')
  const [rosterText, setRosterText] = useState('') // "เลขที่,ชื่อ" บรรทัดละคน
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
      setError('กรอกข้อมูลไม่ครบ')
      return
    }
    const students = parseRosterText()

    // ตรวจสอบเลขที่ซ้ำ (หัวหน้าห้อง vs รายชื่อ, ภายในรายชื่อเอง)
    const allNumbers = [Number(leaderNumber), ...students.map((s) => s.studentNumber)]
    const seen = new Set<number>()
    const duplicates = new Set<number>()
    for (const n of allNumbers) {
      if (seen.has(n)) duplicates.add(n)
      seen.add(n)
    }
    if (duplicates.size > 0) {
      setError(
        `เลขที่ซ้ำกัน: ${Array.from(duplicates).join(', ')}. กรุณาตรวจสอบเลขที่หัวหน้าห้องกับรายชื่อนักเรียนอีกครั้ง`
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
      if (!res.ok) throw new Error(data.error ?? 'เกิดข้อผิดพลาด')
      setResult(data.roster)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function downloadCsv() {
    if (!result) return
    const header = 'เลขที่,ชื่อ,บทบาท,รหัสผ่านชั่วคราว\n'
    const rows = result
      .map((r) => `${r.studentNumber},${r.name},${r.role === 'leader' ? 'หัวหน้าห้อง' : 'นักเรียน'},${r.tempPassword}`)
      .join('\n')
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classCode}_accounts.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (result) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-lg space-y-4">
          <h1 className="font-display text-xl font-bold">สร้างห้องเรียนสำเร็จ!</h1>
          <p className="text-sm text-[var(--text-muted)]">
            รหัสผ่านชั่วคราวด้านล่างจะแสดง<b className="text-[var(--accent-cyan)]"> ครั้งเดียวเท่านั้น</b> กรุณาส่งให้นักเรียนแต่ละคนโดยตรง
            นักเรียนสามารถเปลี่ยนรหัสผ่านเองได้ที่หน้าโปรไฟล์หลังเข้าสู่ระบบครั้งแรก
          </p>
          <button onClick={downloadCsv} className="btn-neon w-full py-3">
            ดาวน์โหลดเป็น CSV
          </button>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-[var(--text-muted)]">
                <tr>
                  <th className="p-3 text-left font-medium">เลขที่</th>
                  <th className="p-3 text-left font-medium">ชื่อ</th>
                  <th className="p-3 text-left font-medium">บทบาท</th>
                  <th className="p-3 text-left font-medium">รหัสผ่านชั่วคราว</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r) => (
                  <tr key={r.studentNumber} className="border-t border-white/5">
                    <td className="p-3 mono">{r.studentNumber}</td>
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">
                      <span className={`pill ${r.role === 'leader' ? 'pill-type' : 'pill-pending'}`}>
                        {r.role === 'leader' ? 'หัวหน้าห้อง' : 'นักเรียน'}
                      </span>
                    </td>
                    <td className="p-3 mono font-semibold text-[var(--accent-cyan)]">{r.tempPassword}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a href="/login" className="block text-center text-[var(--accent-cyan)] font-medium pt-2">
            ไปหน้าเข้าสู่ระบบ →
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-xl font-bold">สร้างห้องเรียน</h1>

        <div className="space-y-3 glass-card p-4">
          <label className="block text-sm font-medium text-[var(--text-muted)]">
            ชื่อห้องเรียน
            <input
              className="mt-1 w-full glass-input p-2.5"
              placeholder="เช่น ป.3/2"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-[var(--text-muted)]">
            รหัสห้อง (นักเรียนใช้ตอนเข้าสู่ระบบ)
            <input
              className="mt-1 w-full glass-input p-2.5"
              placeholder="เช่น 3-2-2026"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm font-medium text-[var(--text-muted)]">
              เลขที่หัวหน้าห้อง
              <input
                type="number"
                className="mt-1 w-full glass-input p-2.5"
                value={leaderNumber}
                onChange={(e) => setLeaderNumber(e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-[var(--text-muted)]">
              ชื่อหัวหน้าห้อง
              <input
                className="mt-1 w-full glass-input p-2.5"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-[var(--text-muted)]">
            รายชื่อนักเรียนที่เหลือ (บรรทัดละ &quot;เลขที่,ชื่อ&quot;)
            <textarea
              className="mt-1 w-full glass-input p-2.5 mono text-sm h-40"
              placeholder={'1,สมชาย\n2,สมหญิง\n3,วิชัย\n...'}
              value={rosterText}
              onChange={(e) => setRosterText(e.target.value)}
            />
          </label>
        </div>

        {error && <p className="text-sm text-[var(--accent-red)]">{error}</p>}

        <button onClick={handleSubmit} disabled={loading} className="btn-neon w-full py-3.5">
          {loading ? 'กำลังสร้าง...' : 'สร้างห้องและรหัสผ่าน'}
        </button>
      </div>
    </main>
  )
}
