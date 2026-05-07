import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import bcrypt from 'bcryptjs'
import { authOptions, isAdmin } from '@/lib/auth'
import pool from '@/lib/db'

interface Params { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await pool.query('DELETE FROM users WHERE id = $1', [params.id])
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { password } = await request.json()
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  const { rowCount } = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [password_hash, params.id]
  )
  if (rowCount === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
