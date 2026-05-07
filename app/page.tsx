import fs from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions, isAdmin } from '@/lib/auth'
import { TopBar } from '@/components/TopBar'

export const dynamic = 'force-dynamic'

let cachedHtml: string | null = null
function getLandingHtml(): string {
  if (cachedHtml) return cachedHtml
  const filePath = path.join(process.cwd(), 'data-landing.html')
  cachedHtml = fs.readFileSync(filePath, 'utf8')
  return cachedHtml
}

export default async function Home() {
  const session = await getServerSession(authOptions)
  const html = getLandingHtml()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%' }}>
      <TopBar
        userEmail={session?.user?.email ?? undefined}
        admin={isAdmin(session?.user?.email)}
      />
      <iframe
        srcDoc={html}
        title="Plan Governance"
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
      />
    </div>
  )
}
