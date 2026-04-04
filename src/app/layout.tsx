import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vasu Traders — Wholesale Ordering",
  description: "Easy wholesale ordering for Vasu Traders customers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main>{children}</main>
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
