import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { ArrowRight, FileText, Home, Images, Inbox, LayoutPanelTop, Phone, Sofa } from "lucide-react";
import { db } from "@/lib/db";
import { collections, journalPosts, media, messages } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { Card, PageHead, formatDate } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function Dashboard() {
  const admin = await requireAdmin();
  const [[c], [j], [m], [unread], latest] = await Promise.all([
    db.select({ n: count() }).from(collections),
    db.select({ n: count() }).from(journalPosts),
    db.select({ n: count() }).from(media),
    db.select({ n: count() }).from(messages).where(eq(messages.read, false)),
    db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5),
  ]);

  const stats = [
    { label: "Koleksiyon", value: c.n, icon: Sofa, href: "/admin/koleksiyonlar" },
    { label: "Journal yazısı", value: j.n, icon: FileText, href: "/admin/journal" },
    { label: "Medya dosyası", value: m.n, icon: Images, href: "/admin/medya" },
    { label: "Okunmamış mesaj", value: unread.n, icon: Inbox, href: "/admin/mesajlar" },
  ];
  const shortcuts = [
    { title: "Ana sayfa videoları ve metinleri", href: "/admin/anasayfa", icon: Home },
    { title: "Header, menü ve footer", href: "/admin/genel", icon: LayoutPanelTop },
    { title: "Telefon, e-posta, adres", href: "/admin/iletisim", icon: Phone },
  ];

  return (
    <div className="stack">
      <PageHead title={`Hoş geldin${admin.name ? `, ${admin.name}` : ""}`} description="Sitenin içeriğini buradan yönetebilirsin." />

      <div className="grid-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="card stat" style={{ color: "inherit" }}>
            <span className="stat__icon"><Icon /></span>
            <span>
              <div className="stat__value">{value}</div>
              <div className="stat__label">{label}</div>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        <Card
          title="Son mesajlar"
          flush
          actions={<Link href="/admin/mesajlar" className="btn btn--sm btn--text">Tümü <ArrowRight /></Link>}
        >
          <div className="dt-wrap">
            <table className="dt">
              <tbody>
                {latest.length === 0 && (
                  <tr className="dt-none"><td>Henüz mesaj yok. Sitedeki iletişim formundan gelenler burada görünür.</td></tr>
                )}
                {latest.map((msg) => (
                  <tr key={msg.id} className={msg.read ? "" : "is-unread"}>
                    <td>
                      <div className="strong">{msg.name}</div>
                      <div className="small muted ellipsis" style={{ maxWidth: 360 }}>{msg.body || msg.email || msg.phone}</div>
                    </td>
                    <td className="ta-r small muted" style={{ whiteSpace: "nowrap" }}>{formatDate(msg.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Hızlı erişim" flush>
          {shortcuts.map(({ title, href, icon: Icon }) => (
            <Link key={href} href={href} className="menu__item" style={{ padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
              <Icon /> {title}
              <ArrowRight style={{ marginLeft: "auto" }} />
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener" className="menu__item" style={{ padding: "13px 16px" }}>
            <Home /> Siteyi yeni sekmede aç
            <ArrowRight style={{ marginLeft: "auto" }} />
          </a>
        </Card>
      </div>
    </div>
  );
}
