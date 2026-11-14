import { getPost, getSetting } from "@/lib/content";
import { OG_SIZE, ogImage } from "@/lib/og";

// Blog yazısı paylaşım kartı: kapak fotoğrafı + kategori + başlık + Hermoza imzası
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Hermoza Kitchen & Atelier blog yazısı";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, g] = await Promise.all([getPost(slug), getSetting("general")]);
  return ogImage({
    title: p?.title ?? g.siteName,
    eyebrow: p?.category ? `Blog · ${p.category}` : "Blog",
    image: p?.image || g.ogImage,
    logo: g.headerLogo || g.logo,
  });
}
