import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const { data: rooms, error } = await supabaseAdmin
    .from('cc_rooms')
    .select('id, name, class_code, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const roomIds = (rooms ?? []).map((r) => r.id)

  const { data: students } = await supabaseAdmin
    .from('cc_students')
    .select('id, room_id')
    .in('room_id', roomIds.length ? roomIds : [-1])

  const { data: posts } = await supabaseAdmin
    .from('cc_posts')
    .select('id, room_id')
    .in('room_id', roomIds.length ? roomIds : [-1])

  const withCounts = (rooms ?? []).map((r) => ({
    ...r,
    studentCount: (students ?? []).filter((s) => s.room_id === r.id).length,
    postCount: (posts ?? []).filter((p) => p.room_id === r.id).length,
  }))

  return NextResponse.json({ rooms: withCounts })
}
