import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { studentId: number }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const { studentId } = await req.json()
  if (!studentId) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { data: student } = await supabaseAdmin
    .from('cc_students')
    .select('id, role')
    .eq('id', studentId)
    .single()

  if (!student) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (student.role === 'leader') {
    return NextResponse.json(
      { error: '반장은 여기서 바로 삭제할 수 없어요. 반장을 다른 학생으로 바꾼 뒤 삭제해주세요.' },
      { status: 400 }
    )
  }

  // cc_checks.student_id는 on delete cascade라서 이 학생의 체크 기록도 같이 정리된다.
  const { error } = await supabaseAdmin.from('cc_students').delete().eq('id', studentId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
