import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/request';
import '../globals.css';
import React from 'react'
import { StyledJsxRegistry } from '../../i18n/StyledJsxRegistry'
import Topbar from '@/components/topbar/Topbar'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LegacyGuard - Digital Estate & Family Protection',
  description: 'Secure digital estate planning, family protection protocols, and legal document management.',
  keywords: 'digital estate, family protection, legal documents, will creation, legacy planning',
  authors: [{ name: 'LegacyGuard' }],
  creator: 'LegacyGuard',
  publisher: 'LegacyGuard',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://legacyguard.app',
    title: 'LegacyGuard - Digital Estate & Family Protection',
    description: 'Secure digital estate planning, family protection protocols, and legal document management.',
    siteName: 'LegacyGuard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LegacyGuard - Digital Estate & Family Protection',
    description: 'Secure digital estate planning, family protection protocols, and legal document management.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  // Enable static rendering
  setRequestLocale(locale);
  
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Topbar locale={locale} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
