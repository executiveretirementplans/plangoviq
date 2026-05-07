'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px',
    background: '#f7f8fc', border: '1.5px solid #e2e6ec',
    borderRadius: 10, fontSize: 14, color: '#1a1a2e',
    fontFamily: 'inherit', outline: 'none',
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#f4f6fb' }}>
      <div style={{
        flex: 1, minWidth: 0,
        background: 'linear-gradient(160deg, #001d3d 0%, #003366 50%, #0a5299 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: 'white', maxWidth: 380 }}>
          <div style={{ color: '#c0a877', fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 20 }}>
            Private Equity Retirement Strategy
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
            Plan Governance Portal
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7 }}>
            Authorized advisor access only. Contact your administrator if you need credentials.
          </div>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 6 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: '#5a6578' }}>Authorized access only</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && (
              <div style={{ padding: '10px 14px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 8, color: '#e11d48', fontSize: 13, fontWeight: 600 }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} style={{
              padding: 13, fontSize: 15, fontWeight: 700, color: 'white',
              background: '#003366', border: 'none', borderRadius: 10, cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4,
              fontFamily: 'inherit',
            }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Signing in…</>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
