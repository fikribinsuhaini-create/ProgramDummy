import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "ProgramByUstazLah",
  description:
    "Aplikasi PWA Islamik: Al-Quran, doa, zikir, dan session/program amalan berpandukan susunan.",
  applicationName: "ProgramByUstazLah",
  manifest: "/manifest.webmanifest",
  themeColor: "#059669"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#059669"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

