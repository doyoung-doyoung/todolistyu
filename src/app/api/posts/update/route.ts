import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { postId, type, title, dueDate, checkerType }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })
  if (session.role !== 'leader') {
    return NextResponse.json({ error: 'หัวหน้าห้องเท่านั้นที่แก้ไขได้' }, { status: 403 })
  }

  const { postId, type, title, dueDate, checkerType } = await req.json()
  if (!postId || !type || !title || !checkerType) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { data: post } = await supabaseAdmin
    .from('cc_posts')
    .select('id, room_id')
    .eq('id', postId)
    .single()

  if (!post || post.room_id !== session.roomId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin
    .from('cc_posts')
    .update({ type, title, due_date: dueDate ?? null, checker_type: checkerType })
    .eq('id', postId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
