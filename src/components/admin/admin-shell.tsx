"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Home,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LayoutPanelTop,
  LogOut,
  Menu,
  Moon,
  Phone,
  Sofa,
  Sun,
} from "lucide-react";
import { logout } from "@/app/admin/actions";
import { ToastProvider } from "@/components/admin/toast";

type NavItem = { href: string; title: string; icon: React.ComponentType; count?: number };
type NavGroup = { title?: string; items: NavItem[] };

function useNav(unread: number): NavGroup[] {
  return [
    { items: [{ href: "/admin", title: "Panel", icon: LayoutDashboard }] },
    {
      title: "İçerik",
      items: [
        { href: "/admin/anasayfa", title: "Ana Sayfa", icon: Home },
        { href: "/admin/koleksiyonlar", title: "Koleksiyonlar", icon: Sofa },
        { href: "/admin/journal", title: "Journal", icon: FileText },
        { href: "/admin/medya", title: "Medya Kütüphanesi", icon: Images },
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/admin/genel", title: "Header & Footer", icon: LayoutPanelTop },
        { href: "/admin/iletisim", title: "İletişim Bilgileri", icon: Phone },
      ],
    },
    {
      title: "Gelen Kutusu",
      items: [{ href: "/admin/mesajlar", title: "Mesajlar", icon: Inbox, count: unread }],
    },
  ];
}

const TITLES: [string, string, string][] = [
  ["/admin/anasayfa", "İçerik", "Ana Sayfa"],
  ["/admin/koleksiyonlar", "İçerik", "Koleksiyonlar"],
  ["/admin/journal", "İçerik", "Journal"],
  ["/admin/medya", "İçerik", "Medya Kütüphanesi"],
  ["/admin/genel", "Site", "Header & Footer"],
  ["/admin/iletisim", "Site", "İletişim Bilgileri"],
  ["/admin/mesajlar", "Gelen Kutusu", "Mesajlar"],
  ["/admin/hesap", "Hesap", "Şifre Değiştir"],
];

const THEME_KEY = "hermoza-admin-theme";

// Tema tercihi tarayıcıda saklanır; useSyncExternalStore ile okunur (sunucuda her zaman açık tema)
const themeListeners = new Set<() => void>();
const themeStore = {
  get: () => {
    try {
      return localStorage.getItem(THEME_KEY) === "dark";
    } catch {
      return false;
    }
  },
  set: (dark: boolean) => {
    try {
      localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    } catch {
      /* yok say */
    }
    themeListeners.forEach((l) => l());
  },
  subscribe: (l: () => void) => {
    themeListeners.add(l);
    return () => themeListeners.delete(l);
  },
};

export function AdminShell({
  admin,
  unread,
  logo,
  children,
}: {
  admin: { name: string; email: string };
  unread: number;
  logo: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = useNav(unread);
  const [drawer, setDrawer] = useState(false);
  const [profile, setProfile] = useState(false);
  const dark = useSyncExternalStore(themeStore.subscribe, themeStore.get, () => false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profile) return;
    const close = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) setProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profile]);

  const toggleTheme = () => themeStore.set(!dark);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
  const [crumb, title] = TITLES.find(([p]) => pathname.startsWith(p))?.slice(1) ?? ["", "Panel"];
  const initial = (admin.name || admin.email).charAt(0).toLocaleUpperCase("tr-TR");

  return (
    <div className={`adm ${drawer ? "drawer-open" : ""}`} data-theme={dark ? "dark" : "light"}>
      <ToastProvider>
        <aside className="sidebar">
          <Link href="/admin" className="sidebar__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" style={{ filter: dark ? "none" : "invert(1)" }} />
            <span>
              <b>HERMOZA</b>
              <small>YÖNETİM</small>
            </span>
          </Link>
          <nav className="sidebar__nav">
            {nav.map((g, gi) => (
              <div key={gi}>
                {g.title && <div className="nav-group">{g.title}</div>}
                {g.items.map(({ href, title: t, icon: Icon, count }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`nav-item ${isActive(href) ? "is-active" : ""}`}
                    onClick={() => setDrawer(false)}
                  >
                    <Icon />
                    <span>{t}</span>
                    {!!count && <span className="count">{count}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar__foot">
            <a href="/" target="_blank" rel="noopener">
              Siteyi görüntüle <ExternalLink />
            </a>
          </div>
        </aside>
        <div className="scrim" onClick={() => setDrawer(false)} />

        <header className="header">
          <button className="header__icon show-mobile" aria-label="Menü" onClick={() => setDrawer(true)}>
            <Menu />
          </button>
          <div className="header__crumbs ellipsis">
            {crumb && <span className="header__crumb">{crumb}</span>}
            <h1 className="header__title ellipsis">{title}</h1>
          </div>
          <div className="grow" />
          <button className="header__icon" onClick={toggleTheme} aria-label="Tema" title={dark ? "Açık mod" : "Koyu mod"}>
            {dark ? <Sun /> : <Moon />}
          </button>
          <Link href="/admin/mesajlar" className="header__icon" aria-label="Mesajlar" title="Mesajlar" style={{ position: "relative" }}>
            <Inbox />
            {unread > 0 && (
              <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "var(--accent)", borderRadius: 1 }} />
            )}
          </Link>
          <span className="header__sep" />
          <div ref={profileRef} style={{ position: "relative" }}>
            <button className="profile-btn" onClick={() => setProfile((v) => !v)} aria-expanded={profile}>
              <span className="avatar">{initial}</span>
              <span className="hide-mobile strong">{admin.name || admin.email}</span>
              <ChevronDown className="hide-mobile muted" style={{ width: 16, height: 16 }} />
            </button>
            {profile && (
              <div className="menu__panel">
                <div className="menu__head">
                  <div className="strong ellipsis">{admin.name || "Yönetici"}</div>
                  <div className="small muted ellipsis">{admin.email}</div>
                </div>
                <Link href="/admin/hesap" className="menu__item" onClick={() => setProfile(false)}>
                  <KeyRound /> Şifre Değiştir
                </Link>
                <button className="menu__item" onClick={toggleTheme}>
                  {dark ? <Sun /> : <Moon />} {dark ? "Açık Mod" : "Koyu Mod"}
                </button>
                <form action={logout} style={{ padding: "6px 14px 4px" }}>
                  <button type="submit" className="btn btn--sm btn--block btn--danger">
                    <LogOut /> Oturumu Kapat
                  </button>
                </form>
              </div>
            )}
          </div>
        </header>

        <main className="main">{children}</main>
      </ToastProvider>
    </div>
  );
}
