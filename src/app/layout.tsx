import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vasu Traders — Wholesale Products",
  description: "Wholesale ordering for Vasu Traders customers — Indore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <BottomNav />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
