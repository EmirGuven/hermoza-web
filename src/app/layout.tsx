import type { Metadata, Viewport } from "next";
import { Geist_Mono, Montserrat, Outfit } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

// Logo tipografisine (Gotham benzeri geometrik sans) en yakın Google fontu
const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600"],
});

// Yönetim paneli fontu (Yaman admin ile aynı)
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Paylaşım kartları ve kanonik adresler için mutlak adres tabanı
  metadataBase: new URL(SITE_URL),
  // Alt sayfa başlıkları "Sayfa | Hermoza Kitchen & Atelier" olarak tamamlanır (ana sayfa kendi başlığını tam verir)
  title: {
    default: "Hermoza Kitchen & Atelier — Ölçüye özel mutfak ve mobilya",
    template: "%s | Hermoza Kitchen & Atelier",
  },
  description:
    "Mutfak, yaşam alanı ve giyinme odası için atölyede üretilen ölçüye özel masif ahşap mobilyalar.",
};

// iPhone'da çentik/durum çubuğu rengi. Sayfanın üstünde koyu yeşil; mobilde kaydırınca header beyaza
// döndüğünde SiteHeader bunu beyaz yapar (header ile aynı renk olsun diye).
export const viewport: Viewport = {
  themeColor: "#0d2622",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      // <head>'deki çerez betiği html'e data-consent ekleyebilir (hidrasyon uyarısı verilmesin)
      suppressHydrationWarning
      className={`${montserrat.variable} ${geistMono.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        {/* Çerez tercihi önceden verildiyse pencere ilk boyamadan önce gizlenir (yanıp sönme olmaz) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(document.cookie.indexOf("hermoza_consent=")>-1)document.documentElement.setAttribute("data-consent","1")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full bg-mist font-sans text-ink">{children}</body>
    </html>
  );
}
