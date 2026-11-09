import type { Metadata } from "next";
import Link from "next/link";
import { getSetting } from "@/lib/content";
import { CookieReset } from "@/components/cookie-reset";

export const metadata: Metadata = { title: "Çerez Politikası ve Aydınlatma Metni" };

export default async function CookiePolicy() {
  const [general, contact] = await Promise.all([getSetting("general"), getSetting("contact")]);
  const h2 = "mb-3 mt-10 text-lg font-normal uppercase tracking-[0.15em] text-forest";
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 font-light leading-relaxed text-ink/75">
      <Link href="/" className="text-[11px] uppercase tracking-[0.3em] text-rust hover:text-forest">← Ana sayfa</Link>
      <h1 className="mb-8 mt-8 text-3xl font-extralight uppercase tracking-[0.15em] text-forest md:text-4xl">
        Çerez Politikası ve Aydınlatma Metni
      </h1>
      <p>
        Bu metin, {general.siteName} (“Firma”) tarafından işletilen web sitesinde kullanılan çerezler ve
        iletişim formu ile bülten üzerinden toplanan kişisel veriler hakkında sizi bilgilendirmek amacıyla
        hazırlanmıştır.
      </p>

      <h2 className={h2}>Kullandığımız çerezler</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li><strong className="font-normal">Zorunlu:</strong> sitenin güvenli çalışması, çerez tercihinizin (hermoza_consent) ve bülten penceresinin bir kez gösterildiğinin (hermoza_nl) hatırlanması için kullanılır. Kapatılamaz.</li>
        <li><strong className="font-normal">Ölçüm:</strong> hangi sayfaların ve koleksiyonların ilgi gördüğünü anonim olarak anlamamızı sağlar. Yalnızca onay verirseniz çalışır.</li>
        <li><strong className="font-normal">Pazarlama:</strong> size ilgi alanlarınıza uygun proje, kampanya ve davetleri ulaştırabilmemiz içindir. Yalnızca onay verirseniz çalışır.</li>
      </ul>
      <p className="mt-4">Tercihiniz 6 ay boyunca saklanır. İstediğiniz zaman değiştirebilirsiniz:</p>
      <CookieReset />

      <h2 className={h2}>Toplanan kişisel veriler ve amaçları</h2>
      <p>
        İletişim formunda paylaştığınız ad, e-posta, telefon ve mesaj bilgileri; talebinize dönüş yapmak, keşif
        randevusu oluşturmak ve randevu bilgilendirmesi göndermek amacıyla işlenir. Bülten için paylaştığınız
        e-posta adresi, açık rızanıza dayanarak yenilik ve kampanya bilgilendirmesi göndermek amacıyla işlenir.
      </p>

      <h2 className={h2}>Haklarınız</h2>
      <p>
        6698 sayılı KVKK’nın 11. maddesi kapsamındaki haklarınızı kullanmak, bülten aboneliğinizi sonlandırmak
        ya da verilerinizin silinmesini istemek için{" "}
        <a href={`mailto:${contact.email}`} className="text-rust underline">{contact.email}</a> adresine
        yazabilirsiniz. Her bülten e-postasında abonelikten çıkma bağlantısı bulunur.
      </p>

      <h2 className={h2}>İletişim</h2>
      <p>
        {general.siteName}
        <br />
        {contact.address}
        <br />
        {contact.phone}
      </p>
      <p className="mt-10 text-xs text-ink/45">
        Not: Bu metin genel bir şablondur; yayına almadan önce hukuk danışmanınızla kontrol etmeniz önerilir.
      </p>
    </main>
  );
}
