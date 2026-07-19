import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// body: { roomId: number }
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const { roomId } = await req.json()
  if (!roomId) return NextResponse.json({ error: 'invalid_body' }, { status: 400 })

  // cc_students, cc_posts, cc_checks 모두 room_id/관련 FK에 on delete cascade가 걸려있어서
  // 반(room)만 지우면 학생/항목/체크 기록이 전부 같이 정리된다.
  const { error } = await supabaseAdmin.from('cc_rooms').delete().eq('id', roomId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
