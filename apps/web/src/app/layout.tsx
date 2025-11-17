import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';

const heading = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'PopFlash | CS2 Markets Reinvented',
  description:
    'Monitor CS2 markets, manage your PopFlash portfolio, and orchestrate escrow-protected trades with Bloomberg-grade intelligence.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="bg-background text-textPrimary antialiased">{children}</body>
    </html>
  );
}