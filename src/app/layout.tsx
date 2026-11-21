import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import SlideNav from "./components/SlideNav";

export const metadata: Metadata = {
  title: "Free Fire Esports Live Broadcast Overlays | Demo-Graph-BD",
  description: "Real-time Free Fire broadcast overlays with live Google Sheets sync and theme manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=Inter:wght@600;700;800&family=Rajdhani:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
        <Suspense fallback={null}>
          <SlideNav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
