import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShortsAI Studio — Convert Long Videos into Viral Shorts Instantly',
  description: 'AI-powered platform that automatically converts long videos into viral YouTube Shorts, Instagram Reels, TikToks and Facebook Reels. Smart reframing, auto-captions, viral scoring, and one-click export.',
  keywords: 'AI video editor, YouTube Shorts creator, TikTok video maker, Instagram Reels, viral video AI, video repurposing tool, short form content',
  openGraph: {
    title: 'ShortsAI Studio — AI Video Repurposing Platform',
    description: 'Turn any long video into viral short-form content in minutes with AI.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShortsAI Studio',
    description: 'AI-powered viral short form video creator.',
  },
  robots: { index: true, follow: true },
  themeColor: '#E5192A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-dark-900 text-white font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
