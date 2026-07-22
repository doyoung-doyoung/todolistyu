import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { postId: number, studentId: number }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

  const { postId, studentId } = await req.json()
  if (!postId || !studentId) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { data: post } = await supabaseAdmin
    .from('cc_posts')
    .select('id, room_id, checker_type')
    .eq('id', postId)
    .single()

  if (!post || post.room_id !== session.roomId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // 권한 규칙:
  // checker_type === 'leader'  -> 반장만, 아무 학생이나 체크 가능 (숙제/준비물 제출 확인)
  // checker_type === 'self'    -> 본인만, 본인 것만 체크 가능 (노트 확인 등)
  if (post.checker_type === 'leader') {
    if (session.role !== 'leader') {
      return NextResponse.json({ error: 'หัวหน้าห้องเท่านั้นที่เช็คได้' }, { status: 403 })
    }
  } else {
    if (session.studentId !== studentId) {
      return NextResponse.json({ error: 'เช็คได้เฉพาะของตัวเองเท่านั้น' }, { status: 403 })
    }
  }

  const { data: existing } = await supabaseAdmin
    .from('cc_checks')
    .select('checked')
    .eq('post_id', postId)
    .eq('student_id', studentId)
    .single()

  const nextChecked = !existing?.checked

  const { error } = await supabaseAdmin
    .from('cc_checks')
    .update({
      checked: nextChecked,
      checked_at: nextChecked ? new Date().toISOString() : null,
      checked_by: session.studentId,
    })
    .eq('post_id', postId)
    .eq('student_id', studentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, checked: nextChecked })
}
