import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './PrivyProvider'


export const metadata: Metadata = {
  title: 'Token Toss - Mint & Send SOL on Telegram',
  description: 'Create meme coins and toss SOL to your Telegram group members',
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className='dark'>
      <body >
        <Providers>
        {children}
        </Providers>
        </body>
    </html>
  )
}
