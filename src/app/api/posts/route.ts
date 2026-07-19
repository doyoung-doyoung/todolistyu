import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

  const { data: posts, error } = await supabaseAdmin
    .from('cc_posts')
    .select('id, type, title, due_date, checker_type, created_at')
    .eq('room_id', session.roomId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const postIds = (posts ?? []).map((p) => p.id)
  const { data: checks } = await supabaseAdmin
    .from('cc_checks')
    .select('post_id, student_id, checked, checked_at')
    .in('post_id', postIds.length ? postIds : [-1])

  return NextResponse.json({ posts, checks: checks ?? [] })
}

// body: { type: 'homework'|'clothes'|'supplies'|'note', title: string, dueDate?: string, checkerType: 'leader'|'self' }
// 반장만 포스트를 만들 수 있음
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })
  if (session.role !== 'leader') {
    return NextResponse.json({ error: '반장만 항목을 등록할 수 있어요' }, { status: 403 })
  }

  const { type, title, dueDate, checkerType } = await req.json()
  if (!type || !title || !checkerType) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { data: post, error } = await supabaseAdmin
    .from('cc_posts')
    .insert({
      room_id: session.roomId,
      type,
      title,
      due_date: dueDate ?? null,
      checker_type: checkerType,
      created_by: session.studentId,
    })
    .select()
    .single()

  if (error || !post) return NextResponse.json({ error: error?.message ?? 'create_failed' }, { status: 400 })

  // 반의 모든 학생에 대해 미체크 상태의 checks row를 미리 생성해둔다 (누가 안 했는지 바로 보이도록)
  const { data: students } = await supabaseAdmin
    .from('cc_students')
    .select('id')
    .eq('room_id', session.roomId)

  if (students?.length) {
    const rows = students.map((s) => ({ post_id: post.id, student_id: s.id, checked: false }))
    await supabaseAdmin.from('cc_checks').insert(rows)
  }

  return NextResponse.json({ ok: true, post })
}
