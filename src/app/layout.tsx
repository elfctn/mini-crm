import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Mini CRM - Müşteri Takip Uygulaması",
  description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  keywords: ["CRM", "müşteri takip", "lead management", "business"],
  authors: [{ name: "Elif Cetin - Mini CRM Team" }],
  viewport: "width=device-width, initial-scale=1",
  openGraph: {
    title: "Mini CRM - Müşteri Takip Uygulaması",
    description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  },
  twitter: {
    card: 'summary',
    title: "Mini CRM - Müşteri Takip Uygulaması",
    description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
