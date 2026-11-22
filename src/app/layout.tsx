import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RTB / Free Fire Esports Broadcast Overlay Suite',
  description: '1080p transparent live tournament broadcast overlay suite with live Google Sheets sync and locked admin panel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" style={{ backgroundColor: 'transparent' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Teko:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'transparent', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
