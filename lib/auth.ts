import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from './db'

async function logLogin(email: string, success: boolean, req: { headers?: Record<string, string | string[] | undefined> } | undefined) {
  try {
    const headers = req?.headers ?? {}
    const fwd = headers['x-forwarded-for']
    const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim()
      || (Array.isArray(headers['x-real-ip']) ? headers['x-real-ip'][0] : headers['x-real-ip'])
      || null
    const ua = Array.isArray(headers['user-agent']) ? headers['user-agent'][0] : (headers['user-agent'] ?? null)
    await pool.query(
      'INSERT INTO login_events (email, success, ip, user_agent) VALUES ($1, $2, $3, $4)',
      [email.slice(0, 200), success, ip ? String(ip).slice(0, 100) : null, ua ? String(ua).slice(0, 500) : null]
    )
  } catch (err) {
    console.error('[auth] failed to log login event:', err)
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminEmail && adminPassword
            && email === adminEmail
            && credentials.password === adminPassword) {
          await logLogin(email, true, req)
          return { id: 'admin', email: adminEmail, name: 'Admin' }
        }

        try {
          const { rows } = await pool.query(
            'SELECT id, email, password_hash, name FROM users WHERE LOWER(email) = $1',
            [email]
          )
          if (rows.length === 0) {
            await logLogin(email, false, req)
            return null
          }
          const user = rows[0]
          const valid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!valid) {
            await logLogin(email, false, req)
            return null
          }
          await logLogin(email, true, req)
          return { id: user.id, email: user.email, name: user.name || user.email }
        } catch {
          await logLogin(email, false, req)
          return null
        }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  return email.toLowerCase().trim() === process.env.ADMIN_EMAIL?.toLowerCase().trim()
}
