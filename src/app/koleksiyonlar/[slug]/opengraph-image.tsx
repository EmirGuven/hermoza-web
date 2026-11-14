import { getCollection, getSetting } from "@/lib/content";
import { OG_SIZE, ogImage } from "@/lib/og";

// Koleksiyon paylaşım kartı: kapak fotoğrafı + "Ölçüye özel" + başlık + Hermoza imzası
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Hermoza Kitchen & Atelier koleksiyonu";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [c, g] = await Promise.all([getCollection(slug), getSetting("general")]);
  return ogImage({
    title: c?.title ?? g.siteName,
    eyebrow: c ? "Ölçüye özel koleksiyon" : "Kitchen & Atelier",
    image: c?.image || g.ogImage,
    logo: g.headerLogo || g.logo,
  });
}
