import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { generateStudentPassword } from '@/lib/password'

// body: { roomId: number, studentNumber: number, name: string }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const { roomId, studentNumber, name } = await req.json()
  if (!roomId || !studentNumber || !name) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const tempPassword = generateStudentPassword(8)
  const hash = await bcrypt.hash(tempPassword, 10)

  const { data: student, error } = await supabaseAdmin
    .from('cc_students')
    .insert({
      room_id: roomId,
      student_number: studentNumber,
      name,
      role: 'student',
      password_hash: hash,
      must_change_password: true,
    })
    .select('id, student_number, name, role')
    .single()

  if (error) {
    const message = error.message.includes('cc_students_room_id_student_number_key')
      ? '이미 사용 중인 번호예요.'
      : error.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  // 학생을 새로 추가할 때, 이미 등록된 항목(post)들에도 미체크 상태의 checks row를 만들어줘야
  // 반장/학생 화면에서 이 학생이 빠짐없이 목록에 나타난다.
  const { data: posts } = await supabaseAdmin.from('cc_posts').select('id').eq('room_id', roomId)
  if (posts?.length) {
    const rows = posts.map((p) => ({ post_id: p.id, student_id: student.id, checked: false }))
    await supabaseAdmin.from('cc_checks').insert(rows)
  }

  return NextResponse.json({ ok: true, student, tempPassword })
}
