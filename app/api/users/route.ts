import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import bcrypt from 'bcryptjs'
import { authOptions, isAdmin } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { rows } = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC')
  return NextResponse.json({ users: rows })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { email, password, name } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  const normalizedEmail = email.toLowerCase().trim()
  if (normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase().trim()) {
    return NextResponse.json({ error: 'That email is already the admin account' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 10)
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [normalizedEmail, password_hash, name || '']
    )
    return NextResponse.json({ user: rows[0] }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
