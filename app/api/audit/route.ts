import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAdmin(session.user?.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(request.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500)

  const { rows } = await pool.query(
    `SELECT id, email, success, ip, user_agent, created_at
     FROM login_events
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  )
  return NextResponse.json({ events: rows })
}
