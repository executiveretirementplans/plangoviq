'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuditEvent {
  id: string
  email: string
  success: boolean
  ip: string | null
  user_agent: string | null
  created_at: string
}

type Tab = 'users' | 'audit'

export function UsersAdmin() {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [resetting, setResetting] = useState<User | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const loadUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/users')
    if (res.ok) { const data = await res.json(); setUsers(data.users) }
    setLoading(false)
  }

  const loadAudit = async () => {
    setLoading(true)
    const res = await fetch('/api/audit?limit=200')
    if (res.ok) { const data = await res.json(); setEvents(data.events) }
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'users') loadUsers()
    else loadAudit()
  }, [tab])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error || 'Failed to create user'); return }
    setEmail(''); setPassword(''); setName(''); setShowAdd(false)
    showToast(`User ${data.user.email} created`)
    loadUsers()
  }

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetting) return
    setSubmitting(true); setError('')
    const res = await fetch(`/api/users/${resetting.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error || 'Failed to reset password'); return }
    showToast(`Password reset for ${resetting.email}`)
    setResetting(null); setPassword('')
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete user ${email}?`)) return
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) { showToast(`Deleted ${email}`); loadUsers() } else showToast('Failed to delete')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: '#f7f8fc',
    border: '1.5px solid #e2e6ec', borderRadius: 8, fontSize: 14,
    color: '#1a1a2e', fontFamily: 'inherit', outline: 'none',
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px', background: 'transparent',
    border: 'none', borderBottom: `2px solid ${active ? '#003366' : 'transparent'}`,
    color: active ? '#003366' : '#5a6578',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit',
  })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })

  const truncate = (s: string | null, n: number) => !s ? '—' : s.length > n ? s.slice(0, n) + '…' : s

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#5a6578', textDecoration: 'none', marginBottom: 16, fontWeight: 600 }}>
        ← Back to site
      </Link>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Admin</h1>
      <p style={{ fontSize: 13, color: '#5a6578', marginTop: 4, marginBottom: 20 }}>
        Manage advisor logins and review login activity.
      </p>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e2e6ec', marginBottom: 24 }}>
        <button onClick={() => setTab('users')} style={tabStyle(tab === 'users')}>Users</button>
        <button onClick={() => setTab('audit')} style={tabStyle(tab === 'audit')}>Audit log</button>
      </div>

      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#5a6578' }}>
              {users.length} advisor{users.length !== 1 ? 's' : ''}
            </div>
            <button onClick={() => setShowAdd(true)} style={{
              padding: '10px 16px', background: '#003366', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              + Add advisor
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #e2e6ec' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef0f4', display: 'grid', gridTemplateColumns: '1.4fr 1fr 130px 180px', gap: 16, fontSize: 11, fontWeight: 700, color: '#5a6578', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              <div>Email</div><div>Name</div><div>Created</div><div></div>
            </div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#5a6578' }}>Loading…</div>
            ) : users.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#5a6578', fontSize: 14 }}>
                No advisors yet. Click <strong>Add advisor</strong> to create one.
              </div>
            ) : (
              users.map(u => (
                <div key={u.id} style={{ padding: '14px 20px', borderBottom: '1px solid #f4f5f9', display: 'grid', gridTemplateColumns: '1.4fr 1fr 130px 180px', gap: 16, alignItems: 'center', fontSize: 14 }}>
                  <div style={{ fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  <div style={{ color: '#444' }}>{u.name || '—'}</div>
                  <div style={{ color: '#5a6578', fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={() => { setResetting(u); setPassword(''); setError('') }} style={{ background: 'transparent', border: '1.5px solid #e2e6ec', color: '#003366', cursor: 'pointer', padding: '6px 10px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', borderRadius: 6 }}>
                      Reset password
                    </button>
                    <button onClick={() => handleDelete(u.id, u.email)} style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '6px 4px', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p style={{ marginTop: 16, fontSize: 12, color: '#5a6578' }}>
            The admin login (set in Railway env vars) is not shown here and can&apos;t be deleted from the app.
          </p>
        </>
      )}

      {tab === 'audit' && (
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #e2e6ec' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef0f4', display: 'grid', gridTemplateColumns: '180px 1.4fr 90px 130px 1fr', gap: 16, fontSize: 11, fontWeight: 700, color: '#5a6578', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <div>When</div><div>Email</div><div>Result</div><div>IP</div><div>Browser</div>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#5a6578' }}>Loading…</div>
          ) : events.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#5a6578', fontSize: 14 }}>
              No login activity yet.
            </div>
          ) : (
            events.map(ev => (
              <div key={ev.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f4f5f9', display: 'grid', gridTemplateColumns: '180px 1.4fr 90px 130px 1fr', gap: 16, alignItems: 'center', fontSize: 13 }}>
                <div style={{ color: '#5a6578', fontSize: 12 }}>{fmtDate(ev.created_at)}</div>
                <div style={{ fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.email}</div>
                <div>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    background: ev.success ? '#dcfce7' : '#fee2e2',
                    color: ev.success ? '#166534' : '#991b1b',
                  }}>
                    {ev.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                </div>
                <div style={{ color: '#5a6578', fontSize: 12, fontFamily: 'monospace' }}>{ev.ip || '—'}</div>
                <div style={{ color: '#5a6578', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ev.user_agent || ''}>
                  {truncate(ev.user_agent, 60)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAdd && (
        <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,61,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleAdd} style={{ background: 'white', borderRadius: 16, padding: 28, width: '90%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Add advisor</h2>
              <button type="button" onClick={() => setShowAdd(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: 18, fontFamily: 'inherit' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="advisor@example.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Name (optional)</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>Password</label>
                <input type="text" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} />
                <p style={{ fontSize: 11, color: '#5a6578', marginTop: 6 }}>
                  Share this password with the advisor. Use Reset password later if they need a new one.
                </p>
              </div>
              {error && (
                <div style={{ padding: '10px 12px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 8, color: '#e11d48', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: '10px 16px', background: '#f4f6fb', border: '1.5px solid #e2e6ec', borderRadius: 8, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                  {submitting ? 'Creating…' : 'Create advisor'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {resetting && (
        <div onClick={() => setResetting(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,29,61,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleResetSubmit} style={{ background: 'white', borderRadius: 16, padding: 28, width: '90%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Reset password</h2>
              <button type="button" onClick={() => setResetting(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: 18, fontFamily: 'inherit' }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#5a6578', marginBottom: 20 }}>
              Set a new password for <strong>{resetting.email}</strong>. The old password stops working immediately.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>New password</label>
                <input type="text" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle} autoFocus />
                <p style={{ fontSize: 11, color: '#5a6578', marginTop: 6 }}>
                  Share this new password with the advisor.
                </p>
              </div>
              {error && (
                <div style={{ padding: '10px 12px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: 8, color: '#e11d48', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setResetting(null)} style={{ flex: 1, padding: '10px 16px', background: '#f4f6fb', border: '1.5px solid #e2e6ec', borderRadius: 8, color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex: 1, padding: '10px 16px', background: '#003366', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: 'inherit' }}>
                  {submitting ? 'Saving…' : 'Set new password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#001d3d', color: 'white', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 2000 }}>
          {toast}
        </div>
      )}
    </div>
  )
}
