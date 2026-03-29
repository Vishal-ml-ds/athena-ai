"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b1326]">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden ml-[280px]">
        {children}
      </main>
    </div>
  );
}
