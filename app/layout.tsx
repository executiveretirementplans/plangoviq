import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plan Governance — PE Retirement Strategy',
  description: 'Centralized retirement plan governance for private equity portfolios.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
