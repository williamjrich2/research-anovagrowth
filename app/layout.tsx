import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font'
import { ThemeProvider } from '@/components/ThemeProvider'
import { CommandPalette } from '@/components/CommandPalette'

export const metadata: Metadata = {
  title: 'AI Labs Research | AnovaGrowth',
  description: 'Breaking beyond model limitations. Independent AI research and breakthrough discovery.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`}>
        <ThemeProvider>
          <CommandPalette />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}