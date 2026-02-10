import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'OpenClaw Activity Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-navy-900 text-white min-h-screen`}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}