import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Outlet } from "react-router-dom";

const FOOTER_H = "h-16";
const FOOTER_PB = "pb-16";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className={`flex-1 ${FOOTER_PB}`}>
        <Outlet />
      </main>
      <Footer fixed className={FOOTER_H} />
    </div>
  );
}
