import type { Metadata } from "next";
import { Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";

// Logo tipografisine (Gotham benzeri geometrik sans) en yakın Google fontu
const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hermoza Wood Industry — Ölçüye özel ahşap mobilya",
  description:
    "Mutfak, yaşam alanı ve giyinme odası için atölyede üretilen ölçüye özel masif ahşap mobilyalar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${montserrat.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-cream font-sans text-ink">{children}</body>
    </html>
  );
}
