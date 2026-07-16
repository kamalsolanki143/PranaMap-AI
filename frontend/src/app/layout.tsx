import type { Metadata } from 'next';
import '../styles/globals.css';
import NavigationSidebar from '@/components/Sidebar/NavigationSidebar';

export const metadata: Metadata = {
  title: 'PranaMap AI | Command Center',
  description: 'AI-powered air quality intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-full overflow-hidden flex bg-background text-text-primary">
        <NavigationSidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
