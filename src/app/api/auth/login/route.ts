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
    .from('cc_rooms')
    .select('id')
    .eq('class_code', classCode)
    .single()

  if (!room) {
    return NextResponse.json({ error: 'ไม่พบรหัสห้องนี้' }, { status: 401 })
  }

  const { data: student } = await supabaseAdmin
    .from('cc_students')
    .select('id, password_hash, role, must_change_password')
    .eq('room_id', room.id)
    .eq('student_number', studentNumber)
    .single()

  if (!student) {
    return NextResponse.json({ error: 'ไม่พบเลขที่นักเรียนนี้' }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, student.password_hash)
  if (!ok) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 })
  }

  await createSession({
    studentId: student.id,
    roomId: room.id,
    role: student.role,
    mustChangePassword: student.must_change_password,
  })

  return NextResponse.json({ ok: true, role: student.role, mustChangePassword: student.must_change_password })
}
