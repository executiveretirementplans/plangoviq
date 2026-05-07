'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  userEmail?: string
  admin?: boolean
}

export function SignOutOverlay({ userEmail, admin }: Props) {
  if (!userEmail) return null

  const btn: React.CSSProperties = {
    padding: '6px 12px', borderRadius: 8,
    background: 'rgba(0,29,61,0.85)', color: 'white',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer', textDecoration: 'none',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  }

  return (
    <div style={{
      position: 'fixed', top: 12, right: 12, zIndex: 100,
      display: 'flex', gap: 8, alignItems: 'center',
      backdropFilter: 'blur(6px)',
    }}>
      {admin && (
        <Link href="/users" style={{ ...btn, background: '#c0a877' }}>
          Manage users
        </Link>
      )}
      <button onClick={() => signOut({ callbackUrl: '/login' })} style={btn}>
        Sign out
      </button>
    </div>
  )
}
