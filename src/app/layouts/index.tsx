import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'

import '../styles/globals.css'

const CormorantGaramond = Cormorant_Garamond({
  variable: '--font-gormorant-garamond',
  subsets: ['cyrillic', 'latin']
})

export const metadata: Metadata = {
  title: 'Екатерина и Дмитрий',
  description: 'Свадебная фото и видео галерея Екатерины и Дмитрия.',
  openGraph: {
    title: 'Екатерина и Дмитрий',
    description: 'Свадебная фото и видео галерея Екатерины и Дмитрия.',
    type: 'website'
  }
}

export function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='ru'>
      <body className={`${CormorantGaramond.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
