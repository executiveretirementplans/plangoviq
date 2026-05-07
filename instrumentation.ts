export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
    try {
      const { default: pool } = await import('./lib/db')
      const { SCHEMA_SQL } = await import('./lib/schema')
      await pool.query(SCHEMA_SQL)
      console.log('[instrumentation] schema migration applied')
    } catch (err) {
      console.error('[instrumentation] schema migration failed:', err)
    }
  }
}
