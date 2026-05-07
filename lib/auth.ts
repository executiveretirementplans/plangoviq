import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()

        // Bootstrap admin via env vars
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminEmail && adminPassword
            && email === adminEmail
            && credentials.password === adminPassword) {
          return { id: 'admin', email: adminEmail, name: 'Admin' }
        }

        // DB users
        try {
          const { rows } = await pool.query(
            'SELECT id, email, password_hash, name FROM users WHERE LOWER(email) = $1',
            [email]
          )
          if (rows.length === 0) return null
          const user = rows[0]
          const valid = await bcrypt.compare(credentials.password, user.password_hash)
          if (!valid) return null
          return { id: user.id, email: user.email, name: user.name || user.email }
        } catch {
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
