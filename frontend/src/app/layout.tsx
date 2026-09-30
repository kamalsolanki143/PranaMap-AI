import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from '@/theme/ThemeContext';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'PranaMap AI | Environmental Intelligence & Climate Resilience',
  description: 'Authoritative Pan-India Environmental Observatory, Inversion Dynamics & CPCB NAQI Analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="bg-background text-text-primary antialiased selection:bg-forestSecondary/20 selection:text-forestPrimary">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
