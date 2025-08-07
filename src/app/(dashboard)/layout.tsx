"use client";
import { ReactNode } from "react";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      {children}
    </div>
  );
}
