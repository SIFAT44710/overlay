import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demo Graph | FFWS Broadcast Overlay Studio",
  description: "Demo Graph - Real-time Free Fire Esports Broadcast Engine",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ backgroundColor: 'rgba(0,0,0,0)' }}
    >
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0)' }}>{children}</body>
    </html>
  );
}
