import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSession } from '@/lib/session'

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

// body: { password: string }
export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return NextResponse.json({ error: 'admin_not_configured' }, { status: 500 })
  }
  if (!password || !safeCompare(String(password), expected)) {
    return NextResponse.json({ error: '비밀번호가 맞지 않아요' }, { status: 401 })
  }

  await createSession({ role: 'admin' })
  return NextResponse.json({ ok: true })
}
