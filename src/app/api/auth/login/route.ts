import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createSession } from '@/lib/session'

// body: { classCode: string, studentNumber: number, password: string }
export async function POST(req: NextRequest) {
  const { classCode, studentNumber, password } = await req.json()

  if (!classCode || !studentNumber || !password) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { data: room } = await supabaseAdmin
    .from('rooms')
    .select('id')
    .eq('class_code', classCode)
    .single()

  if (!room) {
    return NextResponse.json({ error: '반 코드를 찾을 수 없어요' }, { status: 401 })
  }

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, password_hash, role, must_change_password')
    .eq('room_id', room.id)
    .eq('student_number', studentNumber)
    .single()

  if (!student) {
    return NextResponse.json({ error: '학생 번호를 찾을 수 없어요' }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, student.password_hash)
  if (!ok) {
    return NextResponse.json({ error: '비밀번호가 맞지 않아요' }, { status: 401 })
  }

  await createSession({
    studentId: student.id,
    roomId: room.id,
    role: student.role,
    mustChangePassword: student.must_change_password,
  })

  return NextResponse.json({ ok: true, role: student.role, mustChangePassword: student.must_change_password })
}
