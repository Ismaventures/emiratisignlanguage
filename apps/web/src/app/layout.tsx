import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EmirSign AI - Emirati Sign Language Translation',
  description: 'Enterprise AI platform for real-time Emirati Sign Language translation',
  keywords: ['sign language', 'Emirati', 'ESL', 'translation', 'accessibility'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
