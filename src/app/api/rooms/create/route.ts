import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { generateStudentPassword } from '@/lib/password'

// body: {
//   roomName: string,
//   classCode: string,
//   leader: { studentNumber: number, name: string },
//   students: { studentNumber: number, name: string }[]   // 반장을 제외한 나머지 48명
// }
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { roomName, classCode, leader, students } = body

  if (!roomName || !classCode || !leader || !Array.isArray(students)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { data: room, error: roomErr } = await supabaseAdmin
    .from('cc_rooms')
    .insert({ name: roomName, class_code: classCode })
    .select()
    .single()

  if (roomErr || !room) {
    const message = roomErr?.message.includes('cc_rooms_class_code_key')
      ? 'รหัสห้องนี้ถูกใช้ไปแล้ว กรุณาใช้รหัสอื่น'
      : roomErr?.message ?? 'room_create_failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const all = [{ ...leader, role: 'leader' as const }, ...students.map((s: any) => ({ ...s, role: 'student' as const }))]

  // 각 학생마다 서버가 직접 추측 불가능한 임시 비밀번호를 생성 -> bcrypt 해시만 저장.
  // 평문은 응답으로 딱 한 번만 내려주고 DB에는 절대 남기지 않는다.
  const plaintextRoster: { studentNumber: number; name: string; role: string; tempPassword: string }[] = []
  const rows = []

  for (const s of all) {
    const tempPassword = generateStudentPassword(8)
    const hash = await bcrypt.hash(tempPassword, 10)
    rows.push({
      room_id: room.id,
      student_number: s.studentNumber,
      name: s.name,
      role: s.role,
      password_hash: hash,
      must_change_password: true,
    })
    plaintextRoster.push({ studentNumber: s.studentNumber, name: s.name, role: s.role, tempPassword })
  }

  const { error: insertErr } = await supabaseAdmin.from('cc_students').insert(rows)
  if (insertErr) {
    // 학생 등록이 실패하면 방금 만든 room도 같이 롤백한다.
    // (안 지우면 room만 빈 채로 남아서, 같은 class_code로 재시도할 때
    //  "코드가 이미 사용 중"이라는 또 다른 혼란스러운 에러가 난다.)
    await supabaseAdmin.from('cc_rooms').delete().eq('id', room.id)

    const message = insertErr.message.includes('cc_students_room_id_student_number_key')
      ? 'เลขที่ซ้ำกัน กรุณาตรวจสอบเลขที่หัวหน้าห้องกับรายชื่อนักเรียนอีกครั้ง'
      : insertErr.message
    return NextResponse.json({ error: message }, { status: 400 })
  }

  return NextResponse.json({
    room: { id: room.id, name: room.name, classCode: room.class_code },
    roster: plaintextRoster, // 반장이 지금 화면에서 캡처/다운로드해서 학생들에게 직접 전달
  })
}
