import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { postId }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })
  if (session.role !== 'leader') {
    return NextResponse.json({ error: 'หัวหน้าห้องเท่านั้นที่ลบได้' }, { status: 403 })
  }

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  const { data: post } = await supabaseAdmin
    .from('cc_posts')
    .select('id, room_id')
    .eq('id', postId)
    .single()

  if (!post || post.room_id !== session.roomId) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // cc_checks.post_id는 on delete cascade라서 체크 기록도 같이 정리된다.
  const { error } = await supabaseAdmin.from('cc_posts').delete().eq('id', postId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
