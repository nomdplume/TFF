import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'

function verifySignedToken(token: string, secret: string): boolean {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return sig === expected
}

export function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/admin/login'

  if (isAdminPath && !isLoginPath) {
    const token = request.cookies.get('admin_auth')?.value
    const secret = process.env.ADMIN_COOKIE_SECRET!
    const isAuthenticated = token ? verifySignedToken(token, secret) : false

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}