import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The AI Mercadito - AI Agent Marketplace',
  description: 'Find and hire specialized AI agents for your tasks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
