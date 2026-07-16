import type { Metadata } from "next";
import "@/styles/globals.css";
import Sidebar from "@/components/Common/Sidebar";

export const metadata: Metadata = {
  title: "PranaMap AI | Urban Air Quality Intelligence",
  description:
    "AI-powered Urban Air Quality Intervention Intelligence Platform for Indian Smart Cities. Predict, attribute, and act on air pollution in real-time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased overflow-x-hidden">
        {/* Ambient glow blobs */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: "-160px",
            left: "-160px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />
        <div
          className="fixed pointer-events-none"
          style={{
            bottom: 0,
            right: 0,
            width: "400px",
            height: "400px",
            background: "radial-gradient(circle, rgba(255,219,63,0.03) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />
        {children}
      </body>
    </html>
  );
}
