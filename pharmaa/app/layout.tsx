import React from 'react';
import Header from '../src/components/shared/Header';
import Footer from '../src/components/shared/Footer';
import { AppProvider } from '../src/store/AppContext';
import '../src/index.css';

import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'AURA Laboratories',
  description: 'Premium formulation & pharmaceutical skincare routine',
};

const languageInitScript = `
  try {
    var raw = localStorage.getItem('aura-store');
    if (raw) {
      var parsed = JSON.parse(raw);
      var lang = parsed && parsed.state && parsed.state.language;
      if (lang === 'ar' || lang === 'en') {
        document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', lang);
      }
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageInitScript }} />
      </head>
      <body className="antialiased">
        <AppProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-brand-sage-muted/30">
            <Header />
            <main className="flex-grow pt-16 md:pt-24 pb-16">
              {children}
            </main>
            <Footer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
