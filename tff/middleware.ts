import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

async function verifySignedToken(token: string, secret: string): Promise<boolean> {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )

  const sigBytes = Uint8Array.from(
    sig.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  )

  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload))
}

export async function middleware(request: NextRequest) {
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPath = request.nextUrl.pathname === '/admin/login'

  if (isAdminPath && !isLoginPath) {
    const token = request.cookies.get('admin_auth')?.value
    const secret = process.env.ADMIN_COOKIE_SECRET!
    const isAuthenticated = token ? await verifySignedToken(token, secret) : false

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}