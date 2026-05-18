import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/dashboard/Sidebar"; 
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`} 
      style={{ colorScheme: 'dark' }} 
    >
      {/* We apply the deep space navy background globally here. 
        h-screen and overflow-hidden prevent the whole website from scrolling, 
        forcing only the main content area to scroll.
      */}
<body className="bg-[#07111A] text-white" suppressHydrationWarning>        
        {/* THE MASTER WRAPPER: Puts the Sidebar and the Page Content side-by-side */}
        <div className="flex h-full w-full">
          
          {/* 1. THE PERMANENT SIDEBAR */}
          <Sidebar />

          {/* 2. THE DYNAMIC PAGE CONTENT (Discover, Vault, Profile, etc.) */}
          <main className="ml-[100px] flex-1 overflow-y-auto relative p-10">
            <LanguageProvider>
              {children}
            </LanguageProvider>
            
          </main>

        </div>

      </body>
    </html>
  );
}