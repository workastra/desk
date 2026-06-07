import { PropsWithChildren } from 'react';
import { Geist_Mono, Inter } from 'next/font/google';
import { TooltipProvider } from '@universe/x-shadcn/components/tooltip';
import { cn } from '@universe/x-shadcn/lib/utils';
import { ThemeProvider } from '#components/theme-provider';
import '@universe/x-shadcn/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, inter.variable)}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
