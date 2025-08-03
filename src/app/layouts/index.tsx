import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'

import '../styles/globals.css'

const CormorantGaramond = Cormorant_Garamond({
  variable: '--font-gormorant-garamond',
  subsets: ['cyrillic', 'latin']
})

export const metadata: Metadata = {
  title: 'Екатерина и Дмитрий',
  description: 'Свадьба Екатирины и Дмитрия'
}

export function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${CormorantGaramond.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
