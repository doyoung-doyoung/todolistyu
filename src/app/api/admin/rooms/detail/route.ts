import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// GET /api/admin/rooms/detail?roomId=123
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'not_authorized' }, { status: 403 })
  }

  const roomId = Number(req.nextUrl.searchParams.get('roomId'))
  if (!roomId) return NextResponse.json({ error: 'invalid_room' }, { status: 400 })

  const { data: room } = await supabaseAdmin
    .from('cc_rooms')
    .select('id, name, class_code, created_at')
    .eq('id', roomId)
    .single()

  if (!room) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const { data: students } = await supabaseAdmin
    .from('cc_students')
    .select('id, student_number, name, role')
    .eq('room_id', roomId)
    .order('student_number', { ascending: true })

  const { data: posts } = await supabaseAdmin
    .from('cc_posts')
    .select('id, type, title, due_date, checker_type, created_at')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ room, students: students ?? [], posts: posts ?? [] })
}
