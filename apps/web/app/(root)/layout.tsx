"use client";

import { Navbar } from "@/components/Navbar";
import dynamic from "next/dynamic";

const Sidebar = dynamic(
  () => import("@/components/Sidebar").then((mod) => mod.Sidebar),
  { ssr: false } // Sidebar is client-side implementation dependent on Redux state
);
import { useAppSelector } from "@/redux-toolkit/hooks";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSideBarOpen } = useAppSelector((state) => state.sideBarReducer);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="flex pt-16">
        {isSideBarOpen && (
          <div className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:top-16 lg:bottom-0 z-40">
            <Sidebar />
          </div>
        )}
        <main
          className={`w-full min-h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSideBarOpen ? "lg:pl-60" : "lg:pl-0"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
