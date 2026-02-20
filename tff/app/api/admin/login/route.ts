import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

// In-memory rate limiter
const attempts = new Map<string, { count: number; firstAttempt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000 // 10 minutes

function getSignedToken(secret: string): string {
  const payload = Date.now().toString()
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${payload}.${sig}`
}

function verifySignedToken(token: string, secret: string): boolean {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return sig === expected
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record) return false

  // Reset window if expired
  if (now - record.firstAttempt > WINDOW_MS) {
    attempts.delete(ip)
    return false
  }

  return record.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const record = attempts.get(ip)

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    attempts.set(ip, { ...record, count: record.count + 1 })
  }
}

function clearAttempts(ip: string) {
  attempts.delete(ip)
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 10 minutes.' },
      { status: 429 }
    )
  }

  const { password } = await request.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    recordFailedAttempt(ip)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  clearAttempts(ip)

  const secret = process.env.ADMIN_COOKIE_SECRET!
  const token = getSignedToken(secret)

  const cookieStore = await cookies()
  cookieStore.set('admin_auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', '', { maxAge: 0, path: '/' })
  return response
}