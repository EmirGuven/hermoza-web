import type { Metadata } from "next";
import { Geist_Mono, Montserrat, Outfit } from "next/font/google";
import "./globals.css";

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
  title: "Hermoza Kitchen & Atelier — Ölçüye özel mutfak ve mobilya",
  description:
    "Mutfak, yaşam alanı ve giyinme odası için atölyede üretilen ölçüye özel masif ahşap mobilyalar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${montserrat.variable} ${geistMono.variable} ${outfit.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
