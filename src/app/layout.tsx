import type { Metadata } from "next";
import "./globals.css";

import Header from "@/features/shared/components/Header/Header";
import Footer from "@/features/shared/components/Footer/Footer";

export const metadata: Metadata = {
  title: "UzChess",
  description: "UzChess React project migrated to Next.js with App Router.",
};

export default function RootLayout({children,}: { children: React.ReactNode}) {
  return (
    <html lang="en">
    <body className="min-h-screen flex flex-col bg-black">

    <div className="sticky top-0 z-50">
      <Header />
    </div>

    <main className="flex-1">
      {children}
    </main>

    <Footer />

    </body>
    </html>
  );
}