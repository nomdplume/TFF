import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function verifySignedToken(token: string, secret: string): boolean {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return sig === expected
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  const isAuthenticated = token ? verifySignedToken(token, process.env.ADMIN_COOKIE_SECRET!) : false

  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { table, data, returning } = await request.json()

  if (returning) {
    const { data: inserted, error } = await supabaseAdmin
      .from(table)
      .insert(data)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(inserted)
  }

  const { error } = await supabaseAdmin.from(table).insert(data)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  const isAuthenticated = token ? verifySignedToken(token, process.env.ADMIN_COOKIE_SECRET!) : false
  if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id, data } = await request.json()
  const { error } = await supabaseAdmin.from(table).update(data).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_auth')?.value
  const isAuthenticated = token ? verifySignedToken(token, process.env.ADMIN_COOKIE_SECRET!) : false
  if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { table, id } = await request.json()
  const { error } = await supabaseAdmin.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}