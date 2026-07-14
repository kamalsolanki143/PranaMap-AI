import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PranaMap AI',
  description: 'Air quality intelligence platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
