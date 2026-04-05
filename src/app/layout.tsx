import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import ChatWidget from "@/components/ChatWidget";
import BackgroundEffect from "@/components/BackgroundEffect";
import CursorGlow from "@/components/CursorGlow";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VASU TRADERS 🎰",
  description: "Wholesale Supplier · Indore, MP",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ colorScheme: 'light' }}>
      <body className={`${geist.className} min-h-screen`} style={{ background: 'transparent' }}>
        <LanguageProvider>
          <CartProvider>
            <BackgroundEffect />
            <CursorGlow />
            <Header />
            <main className="min-h-[calc(100vh-4rem)]" style={{ position: 'relative', zIndex: 1 }}>{children}</main>
            <BottomNav />
            <ChatWidget />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
