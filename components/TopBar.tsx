'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface Props {
  userEmail?: string
  admin?: boolean
}

export function TopBar({ userEmail, admin }: Props) {
  const btn: React.CSSProperties = {
    padding: '7px 14px', borderRadius: 6,
    background: 'rgba(255,255,255,0.08)', color: 'white',
    fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
    border: '1px solid rgba(255,255,255,0.18)',
    cursor: 'pointer', textDecoration: 'none',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  }

  const adminBtn: React.CSSProperties = {
    ...btn,
    background: '#c0a877',
    border: '1px solid #c0a877',
    color: '#001d3d',
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'linear-gradient(90deg, #001d3d 0%, #003366 100%)',
      borderBottom: '1px solid rgba(192,168,119,0.25)',
      flexShrink: 0,
      height: 52,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 22, background: '#c0a877', borderRadius: 2 }} />
        <div style={{ color: 'white', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em' }}>
          PE Retirement Strategy
        </div>
      </div>
      {userEmail && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginRight: 6 }}>
            {userEmail}
          </span>
          {admin && <Link href="/users" style={adminBtn}>Manage users</Link>}
          <button onClick={() => signOut({ callbackUrl: '/login' })} style={btn}>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
