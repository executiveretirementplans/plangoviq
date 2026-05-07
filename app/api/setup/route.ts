import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { SCHEMA_SQL } from '@/lib/schema'

export async function GET() {
  try {
    await pool.query(SCHEMA_SQL)
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    )
    return NextResponse.json({ success: true, tables: tables.rows.map(r => r.table_name) })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
