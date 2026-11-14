// Panelden yönetilen içeriklerin tipleri ve varsayılan değerleri.
// Veritabanında kayıt yoksa (veya DB'ye ulaşılamazsa) site bu değerlerle açılır.

export type NavLink = { label: string; href: string };

export type GeneralSettings = {
  siteName: string;
  seoTitle: string;
  seoDescription: string;
  logo: string; // ikon: admin paneli, e-postalar (boşsa header da bunu kullanır)
  /** Sitenin üst menüsündeki logo (imza). Şeffaf zeminli, beyaz. Boşsa ikon kullanılır. */
  headerLogo: string;
  menuImage: string; // tam ekran menüdeki görsel
  headerCtaLabel: string;
  headerCtaHref: string;
  menuLinks: NavLink[];
  footerLinks: NavLink[];
  footerCopyright: string;
  newsletterEnabled: boolean;
  /** Sayfada bir süre gezinen ziyaretçiye bülten açılır penceresi */
  newsletterPopup: boolean;
  /** Sosyal medyada paylaşılınca görünen görsel (1200x630) */
  ogImage: string;
  /** Google Search Console doğrulama kodu (meta etiketindeki content değeri) */
  googleVerification: string;
  /** Bing Webmaster doğrulama kodu */
  bingVerification: string;
  /** Microsoft Clarity proje kimliği (ziyaretçi "Ölçüm" çerezine onay verirse yüklenir) */
  clarityId: string;
};

export type ContactSettings = {
  phone: string;
  email: string;
  address: string;
  mapsUrl: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
};

export type VideoSet = { desktop: string; mobile: string; poster: string };

export type HomeSettings = {
  hero: VideoSet;
  bespoke: {
    eyebrow: string;
    heading: string;
    highlight: string; // başlıkta vurgulanan kısım (başlığın içinde geçmeli)
    text: string;
    buttonLabel: string;
    buttonHref: string;
    video: VideoSet;
  };
  collections: { eyebrow: string; title: string; text: string };
  journal: { eyebrow: string; title: string };
  contact: { eyebrow: string; title: string; text: string };
};

export type GalleryImage = { src: string; caption: string };

export type Collection = {
  id: number;
  sort: number;
  slug: string;
  title: string;
  body: string;
  subtitle: string;
  content: string;
  image: string;
  gallery: GalleryImage[];
  highlights: string[];
  seoTitle: string;
  seoDescription: string;
  linkLabel: string;
  linkHref: string;
  active: boolean;
};

export type BlogPost = {
  id: number;
  sort: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  href: string;
  seoTitle: string;
  seoDescription: string;
  active: boolean;
  publishedAt: Date;
  updatedAt: Date;
};
/** Eski ad */
export type JournalPost = BlogPost;

const m = (p: string) => `/media/${p}`;

export const defaultGeneral: GeneralSettings = {
  siteName: "Hermoza Kitchen & Atelier",
  seoTitle: "Hermoza Kitchen & Atelier — Ölçüye özel mutfak ve mobilya",
  seoDescription:
    "Mutfak, yaşam alanı ve giyinme odası için atölyede üretilen ölçüye özel masif ahşap mobilyalar.",
  logo: m("brand/hermoza-icon-white.png"),
  headerLogo: m("brand/hermoza-imza-white.png"),
  menuImage: m("images/proje-bodrum-yazlik.jpg"),
  headerCtaLabel: "Randevu al",
  headerCtaHref: "#iletisim",
  menuLinks: [
    { label: "Koleksiyonlar", href: "/#koleksiyonlar" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Blog", href: "/blog" },
    { label: "İletişim", href: "/iletisim" },
  ],
  footerLinks: [
    { label: "Koleksiyonlar", href: "/#koleksiyonlar" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "Blog", href: "/blog" },
    { label: "İletişim", href: "/iletisim" },
  ],
  footerCopyright: "© 2026 Hermoza Kitchen & Atelier",
  newsletterEnabled: true,
  newsletterPopup: true,
  ogImage: "/og-hermoza.jpg",
  googleVerification: "",
  bingVerification: "",
  clarityId: "",
};

export const defaultContact: ContactSettings = {
  phone: "+90 543 103 93 93",
  email: "info@hermoza.com.tr",
  address: "Nato, Ünalan Sk. No:7/A, Dudullu, Ümraniye / İstanbul",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Ünalan Sk. No:7/A Dudullu Ümraniye İstanbul"),
  facebook: "https://facebook.com/hermozakitchenateiler",
  instagram: "",
  whatsapp: "",
};

export const defaultHome: HomeSettings = {
  hero: {
    desktop: m("videos/hero-1080.mp4"),
    mobile: m("videos/hero-720.mp4"),
    poster: m("videos/hero-poster.jpg"),
  },
  bespoke: {
    eyebrow: "Bespoke",
    heading:
      "Bir mobilyanın değeri, yıllar sonra bile ilk günkü gibi kapanan bir kapakta gizlidir. Biz o kapağı ölçüyle, sabırla ve elle yapıyoruz.",
    highlight: "ölçüyle, sabırla ve elle",
    text: "Katalogdan seçmek yerine mekanınız için sıfırdan çizilen mobilyalar. Her proje tek, her parça imzalı.",
    buttonLabel: "Projenizi anlatın",
    buttonHref: "#iletisim",
    video: {
      desktop: m("videos/bespoke-1080.mp4"),
      mobile: m("videos/bespoke-720.mp4"),
      poster: m("videos/bespoke-poster.jpg"),
    },
  },
  collections: {
    eyebrow: "HERMOZA İMZASI",
    title: "Mekana Özgü Bir İmza..",
    text: "Her tasarım, ait olduğu mekanın mimarisinden doğar. Malzeme seçiminden birleşim detaylarına kadar her karar, Hermoza atölyesinde özenle şekillenir.",
  },
  journal: { eyebrow: "Journal", title: "Atölyeden notlar" },
  contact: {
    eyebrow: "İletişim",
    title: "Showroom’da buluşalım",
    text: "Malzemelere dokunmak, numuneleri görmek ve projenizi konuşmak için randevu oluşturun. 48 saat içinde dönüş yapıyoruz.",
  },
};

const collection = (
  sort: number,
  slug: string,
  title: string,
  body: string,
  image: string,
  highlights: string[]
): Omit<Collection, "id"> => ({
  sort,
  slug,
  title,
  body,
  subtitle: "",
  content: "",
  image,
  gallery: [],
  highlights,
  seoTitle: "",
  seoDescription: "",
  linkLabel: "Keşfet",
  linkHref: "#iletisim",
  active: true,
});

/** Veritabanına ulaşılamazsa gösterilen koleksiyonlar (canlıdaki içerikle aynı tutulur) */
export const defaultCollections: Omit<Collection, "id">[] = [
  collection(
    1,
    "mutfak",
    "Mutfak",
    "Masif ahşabın sıcaklığı, doğal taşın karakteri ve pişirme alışkanlıklarınıza göre planlanan çekmece düzeni.",
    m("images/img-4963.jpg"),
    []
  ),
  collection(
    2,
    "yasam-alani",
    "Yaşam Alanı",
    "Mekana özel kitaplıklar, TV üniteleri ve konsollar, ahşabın sıcaklığını evin en çok vakit geçirdiğiniz köşesine taşır.",
    m("images/img-4875.png"),
    []
  ),
  collection(
    3,
    "banyo",
    "Banyo",
    "Doğal dokular ve mekana özel banyo dolaplarıyla ferah, düzenli bir alan.",
    m("images/2.png"),
    []
  ),
];

const post = (
  slug: string,
  category: string,
  title: string,
  excerpt: string,
  image: string,
  date: string
): Omit<BlogPost, "id"> => ({
  sort: 0,
  slug,
  category,
  title,
  excerpt,
  content: "",
  image,
  href: "",
  seoTitle: "",
  seoDescription: "",
  active: true,
  publishedAt: new Date(date),
  updatedAt: new Date(date),
});

/** Veritabanına ulaşılamazsa gösterilen yazılar */
export const defaultJournal: Omit<BlogPost, "id">[] = [
  post(
    "masif-ceviz-neden-yillar-gectikce-guzellesir",
    "Malzeme",
    "Masif ceviz neden yıllar geçtikçe güzelleşir?",
    "Cevizin rengi, dokusu ve yaşlandıkça kazandığı derinlik üzerine atölyeden notlar.",
    m("images/journal-ceviz.jpg"),
    "2026-11-09T12:00:00+03:00"
  ),
  post(
    "zekeriyakoyde-tas-ve-ahsabin-bulustugu-bir-mutfak",
    "Proje",
    "Zekeriyaköy’de taş ve ahşabın buluştuğu bir mutfak",
    "Doğal taş tezgah ve masif kapaklarla, bahçeye açılan bir aile mutfağının hikayesi.",
    m("images/journal-zekeriyakoy.jpg"),
    "2026-11-09T12:00:00+03:00"
  ),
  post(
    "ada-mutfak-planlarken-dikkat-edilmesi-gereken-5-olcu",
    "Rehber",
    "Ada mutfak planlarken dikkat edilmesi gereken 5 ölçü",
    "Geçiş boşluklarından tezgah yüksekliğine, ada mutfağı rahat kullanmanın ölçüleri.",
    m("images/journal-ada-mutfak.jpg"),
    "2026-11-09T12:00:00+03:00"
  ),
];

export const SETTING_DEFAULTS = {
  general: defaultGeneral,
  contact: defaultContact,
  home: defaultHome,
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SettingValue<K extends SettingKey> = (typeof SETTING_DEFAULTS)[K];

/** Telefon numarasından tel: ve wa.me bağlantısı üretir */
export function phoneDigits(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
}
