import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { postId: number }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const { postId } = await req.json()
  if (!postId) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  // cc_checks.post_id는 on delete cascade라서 이 항목의 체크 기록도 같이 정리된다.
  const { error } = await supabaseAdmin.from('cc_posts').delete().eq('id', postId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
