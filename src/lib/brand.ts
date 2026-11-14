// Marka anlatısı ve sık sorulan sorular: Hakkımızda sayfası, schema.org (FAQPage) ve llms.txt aynı
// kaynaktan beslenir. GEO (yapay zeka asistanları) için bilgiler her yerde birebir aynı olmalı.
// Yalnızca doğrulanmış bilgiler yazılır; yıl, proje sayısı gibi rakamlar eklenmeden önce teyit edilmeli.

export const BRAND_TAGLINE = "Ölçüye özel mutfak, yaşam alanı ve banyo mobilyaları";

export const BRAND_STORY = [
  "Hermoza Kitchen & Atelier, mekana özel mobilyayı bir zanaat olarak ele alan bir tasarım ve üretim atölyesidir.",
  "Katalogdan seçilen hazır ürünler yerine, her projeyi mekanın kendi ölçülerinden ve sahiplerinin yaşam biçiminden yola çıkarak sıfırdan çiziyoruz.",
  "Tasarımdan üretime, montajdan teslime kadar her aşama aynı ekip tarafından yürütülür; her parça kendi atölyemizde, elde son işçilikle üretilir.",
];

export const BRAND_PILLARS = [
  { title: "Ölçü", text: "Her proje, mekanın yerinde alınan ölçüleriyle başlar. Hiçbir parça hazır kalıptan gelmez." },
  { title: "Malzeme", text: "Masif ahşap, doğal kaplamalar ve karakterli doğal taşlar; yıllar geçtikçe güzelleşen yüzeyler." },
  { title: "Zanaat", text: "Kendi atölyemizde üretim, elde son işçilik ve kendi ekibimizle titiz bir montaj." },
];

export const BRAND_PROCESS = [
  { title: "Keşif ve ölçü", text: "Mekanınızı yerinde ölçüyor, kullanım alışkanlıklarınızı ve beklentilerinizi dinliyoruz." },
  { title: "Tasarım ve malzeme", text: "Çizimleri birlikte netleştiriyor, malzeme seçimlerini showroom’da numunelerle yapıyoruz." },
  { title: "Atölyede üretim", text: "Her parça kendi atölyemizde, ölçünüze göre üretilir ve elde son işçilikten geçer." },
  { title: "Montaj ve teslim", text: "Kendi ekibimizle monte ediyor, son ayarları yapıp mekanı temiz teslim ediyoruz." },
];

export type Faq = { q: string; a: string };

/** Sık sorulan sorular. {adres} yer tutucusu iletişim ayarlarındaki adresle doldurulur. */
export const BRAND_FAQ: Faq[] = [
  {
    q: "Hermoza Kitchen & Atelier ne yapar?",
    a: "Mutfak, yaşam alanı ve banyo için ölçüye özel mobilya tasarlar ve kendi atölyesinde üretir. Her proje mekanın ölçülerinden ve kullanım alışkanlıklarından yola çıkılarak sıfırdan çizilir.",
  },
  {
    q: "Keşif ve ölçü alımı ücretli mi?",
    a: "Hayır. Keşif ücretsizdir; talebinize 48 saat içinde dönüş yapılır ve mekanınız yerinde ölçülür.",
  },
  {
    q: "Proje süreci nasıl işler?",
    a: "Süreç dört aşamadan oluşur: yerinde keşif ve ölçü, birlikte tasarım ve malzeme seçimi, atölyede üretim, kendi ekibimizle montaj ve teslim.",
  },
  {
    q: "Üretim nerede yapılıyor?",
    a: "Tüm mobilyalar kendi atölyemizde, ölçüye özel olarak üretilir ve elde son işçilikten geçer. Montaj da kendi ekibimiz tarafından yapılır.",
  },
  {
    q: "Showroom nerede?",
    a: "Showroom adresimiz: {adres}. Malzemeleri görmek ve projenizi konuşmak için randevu oluşturabilirsiniz.",
  },
];

export const faqWithAddress = (address: string): Faq[] =>
  BRAND_FAQ.map((f) => ({ ...f, a: f.a.replace("{adres}", address || "İstanbul") }));
