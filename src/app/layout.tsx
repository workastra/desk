import { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { getClientEnvironment } from '@internal/base/config/client';
import '@internal/base/immerjs/init';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateMetadata(): Metadata {
  return {
    title: 'Workastra Desk',
    other: {
      version: getClientEnvironment('NEXT_PUBLIC_APP_VERSION'),
    },
  };
}

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang='en' className='text-[14px]'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
