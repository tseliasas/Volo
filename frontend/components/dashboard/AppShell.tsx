"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHero = pathname === "/";

  if (isHero) {
    return <main className="relative h-screen w-full overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="w-full flex-1 overflow-y-auto relative px-4 pb-28 pt-5 sm:px-6 md:p-8 lg:ml-[120px] lg:p-10">
        {children}
      </main>
    </div>
  );
}
