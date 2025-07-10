import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

// inter font ailesi - google fonts'tan yüklenir
const inter = Inter({ subsets: ["latin"] });

// sayfa metadata bilgileri - seo ve sosyal medya için
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: "Mini CRM - Müşteri Takip Uygulaması",
  description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  keywords: ["CRM", "müşteri takip", "lead management", "business"],
  authors: [{ name: "Elif Cetin - Mini CRM Team" }],
  viewport: "width=device-width, initial-scale=1",
  // open graph meta etiketleri - facebook ve diğer sosyal medya için
  openGraph: {
    title: "Mini CRM - Müşteri Takip Uygulaması",
    description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  },
  // twitter card meta etiketleri - twitter paylaşımları için
  twitter: {
    card: 'summary',
    title: "Mini CRM - Müşteri Takip Uygulaması",
    description: "Küçük işletmeler için basit ve etkili müşteri takip sistemi",
  },
};

// ana layout bileşeni - tüm sayfalar için ortak yapı
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        {/* auth provider - kullanıcı kimlik doğrulama durumunu yönetir */}
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
