import type { Metadata } from "next";
import { Geist, Geist_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/dashboard/AppShell";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Volo", // Kept your title!
  description: "AI Travel and Holiday Intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${silkscreen.variable} antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      {/* We apply the deep space navy background globally here.
        h-screen and overflow-hidden prevent the whole website from scrolling,
        forcing only the main content area to scroll.
      */}
<body className="bg-[#0A1929] text-white" suppressHydrationWarning>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>

      </body>
    </html>
  );
}
