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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
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
