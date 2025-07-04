import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Theme } from '@radix-ui/themes';
import { QueryProvider } from '@/providers/QueryProvider';
import './globals.css';
import '@radix-ui/themes/styles.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BrainTrade - Tokenized Expert Consultations',
  description: 'Personal consultations with AI experts on any topic. Select an expert and start a chat.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BrainTrade',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BrainTrade" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <Theme accentColor="blue" grayColor="gray" radius="medium">
            {children}
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}
