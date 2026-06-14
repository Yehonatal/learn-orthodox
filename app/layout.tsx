import type { Metadata } from 'next';
import { Cormorant_Garamond, Noto_Serif_Ethiopic, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import AOSInit from '@/components/AOSInit';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
});

const notoSerifEthiopic = Noto_Serif_Ethiopic({
  subsets: ['ethiopic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-noto-serif-ethiopic',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Learn Orthodox — Divine Liturgy Reader',
  description: 'Trilingual liturgy reader for the Divine Liturgy of St. Dioscoros, providing text in Ge\'ez, Amharic, and English.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html 
      lang="en" 
      className={`${cormorant.variable} ${notoSerifEthiopic.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-parchment text-text-ink selection:bg-accent-gold/20 font-sans">
        <AOSInit />
        <Toaster position="top-right" toastOptions={{ className: 'sonner-toast-custom' }} />
        {children}
      </body>
    </html>
  );
}
