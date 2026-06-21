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
        <LanguageProvider>
          <div className="flex min-h-screen w-full">
            
            {/* 1. THE PERMANENT SIDEBAR */}
            
              <Sidebar />
            
            

            {/* 2. THE DYNAMIC PAGE CONTENT (Discover, Vault, Profile, etc.) */}
            <main className="w-full flex-1 overflow-y-auto relative px-4 pb-28 pt-5 sm:px-6 md:p-8 lg:ml-[120px] lg:p-10">
            
              {children}
              
              
            </main>

          </div>
        </LanguageProvider>

      </body>
    </html>
  );
}
