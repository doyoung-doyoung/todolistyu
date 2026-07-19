import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getSession, createSession } from '@/lib/session'

// body: { oldPassword: string, newPassword: string }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: '새 비밀번호는 6자 이상이어야 해요' }, { status: 400 })
  }

  const { data: student } = await supabaseAdmin
    .from('cc_students')
    .select('id, password_hash')
    .eq('id', session.studentId)
    .single()

  if (!student) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const ok = await bcrypt.compare(oldPassword, student.password_hash)
  if (!ok) return NextResponse.json({ error: '현재 비밀번호가 맞지 않아요' }, { status: 401 })

  const newHash = await bcrypt.hash(newPassword, 10)
  const { error } = await supabaseAdmin
    .from('cc_students')
    .update({ password_hash: newHash, must_change_password: false })
    .eq('id', student.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // 세션도 must_change_password=false로 갱신
  await createSession({
    studentId: session.studentId,
    roomId: session.roomId,
    role: session.role,
    mustChangePassword: false,
  })

  return NextResponse.json({ ok: true })
}
