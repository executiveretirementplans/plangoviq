import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
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
