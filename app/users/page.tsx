import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '@/lib/auth'
import { UsersAdmin } from '@/components/UsersAdmin'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!isAdmin(session.user?.email)) redirect('/')

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', padding: '32px 24px' }}>
      <UsersAdmin />
    </div>
  )
}
