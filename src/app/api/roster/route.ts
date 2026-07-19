import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'not_logged_in' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('students')
    .select('id, student_number, name, role')
    .eq('room_id', session.roomId)
    .order('student_number', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ roster: data })
}
