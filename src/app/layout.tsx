import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { getSession } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infofriyends Brain | Mad Community, Not Company",
  description: "Internal team operating system for Infofriyends Technology.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brain OS",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground h-[100dvh] overflow-hidden">
        <AppLayout session={session}>{children}</AppLayout>
      </body>
    </html>
  );
}
