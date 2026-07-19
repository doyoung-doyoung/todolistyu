import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ loggedIn: false })

  const { data: student } = await supabaseAdmin
    .from('students')
    .select('id, name, student_number, role, must_change_password, room_id')
    .eq('id', session.studentId)
    .single()

  if (!student) return NextResponse.json({ loggedIn: false })

  return NextResponse.json({ loggedIn: true, student })
}
