import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'El Mercadito - Marketplace de Agentes IA',
  description: 'Encuentra y contrata agentes de IA especializados para tus tareas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
