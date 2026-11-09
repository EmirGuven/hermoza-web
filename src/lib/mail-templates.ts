// Mail şablonlarının varsayılanları. Panelden (E-posta > Mail Şablonları) düzenlenebilir;
// düzenlenmemişse bu metinler kullanılır. Değişkenler {{degisken}} biçiminde yazılır.

export type TemplateKey =
  | "contact_customer"
  | "contact_admin"
  | "appointment_customer"
  | "newsletter_welcome";

export type TemplateDef = {
  key: TemplateKey;
  title: string;
  description: string;
  /** Bu şablonda kullanılabilen değişkenler (ortak olanlar hariç) */
  vars: Record<string, string>;
  subject: string;
  html: string;
};

/** Her şablonda kullanılabilen ortak değişkenler */
export const COMMON_VARS: Record<string, string> = {
  site_adi: "Hermoza Kitchen & Atelier",
  site_url: "Sitenin adresi",
  logo_url: "Logo görselinin adresi",
  firma_telefon: "İletişim bilgilerindeki telefon",
  firma_eposta: "İletişim bilgilerindeki e-posta",
  firma_adres: "İletişim bilgilerindeki adres",
  harita_url: "Harita bağlantısı",
  yil: "Bu yıl",
};

/** Ortak çerçeve: üstte yeşil logo bandı, altta firma bilgileri */
function layout(inner: string, footerExtra = "") {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{site_adi}}</title>
</head>
<body style="margin:0;padding:0;background:#f4ede6;font-family:Helvetica,Arial,sans-serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede6;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;">
      <tr>
        <td style="background:#153a34;padding:28px 32px;" align="left">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;"><img src="{{logo_url}}" alt="" height="44" style="display:block;height:44px;width:auto;border:0;"></td>
            <td style="color:#ffffff;font-size:16px;letter-spacing:4px;line-height:1.2;">HERMOZA<br><span style="font-size:9px;letter-spacing:5px;color:#c9957d;">KITCHEN &amp; ATELIER</span></td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="padding:36px 32px 28px;font-size:15px;line-height:1.65;color:#1a1a1a;">
${inner}
      </td></tr>
      <tr><td style="padding:20px 32px 28px;border-top:1px solid #ece4da;font-size:12px;line-height:1.7;color:#7a7f87;">
        <strong style="color:#153a34;">{{site_adi}}</strong><br>
        {{firma_adres}}<br>
        <a href="tel:{{firma_telefon}}" style="color:#b34a25;text-decoration:none;">{{firma_telefon}}</a> &nbsp;·&nbsp;
        <a href="mailto:{{firma_eposta}}" style="color:#b34a25;text-decoration:none;">{{firma_eposta}}</a>
        ${footerExtra}
      </td></tr>
    </table>
    <p style="font-size:11px;color:#9a9286;margin:16px 0 0;">© {{yil}} {{site_adi}}</p>
  </td></tr>
</table>
</body>
</html>`;
}

const h1 = (t: string) =>
  `<h1 style="margin:0 0 18px;font-size:22px;font-weight:300;letter-spacing:1px;color:#153a34;">${t}</h1>`;
const p = (t: string) => `<p style="margin:0 0 14px;">${t}</p>`;
const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;"><tr><td style="background:#b34a25;">
  <a href="${href}" style="display:inline-block;padding:13px 26px;color:#ffffff;text-decoration:none;font-size:12px;letter-spacing:3px;text-transform:uppercase;">${label}</a>
</td></tr></table>`;
const row = (label: string, value: string) =>
  `<tr><td style="padding:9px 12px;border-bottom:1px solid #ece4da;color:#7a7f87;font-size:13px;width:120px;vertical-align:top;">${label}</td><td style="padding:9px 12px;border-bottom:1px solid #ece4da;font-size:14px;">${value}</td></tr>`;

export const TEMPLATES: TemplateDef[] = [
  {
    key: "contact_customer",
    title: "Müşteriye: Talebiniz alındı",
    description: "İletişim formunu dolduran kişiye hemen gönderilir (e-posta yazdıysa).",
    vars: { ad: "Müşterinin adı", eposta: "Müşterinin e-postası", telefon: "Müşterinin telefonu", mesaj: "Yazdığı mesaj" },
    subject: "Talebinizi aldık — {{site_adi}}",
    html: layout(
      `${h1("Merhaba {{ad}},")}
${p("Bize ulaştığınız için teşekkür ederiz. Talebiniz ekibimize iletildi; en geç <strong>48 saat</strong> içinde sizi arayarak keşif randevusu için uygun bir gün ve saat belirleyeceğiz.")}
${p("Randevu kesinleştiğinde tarih ve saati size ayrıca e-postayla bildireceğiz.")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#faf7f3;">
${row("Mesajınız", "{{mesaj}}")}
${row("Telefon", "{{telefon}}")}
</table>
${p("Acil bir durum için bizi <a href=\"tel:{{firma_telefon}}\" style=\"color:#b34a25;\">{{firma_telefon}}</a> numarasından arayabilirsiniz.")}
${p("Sevgilerimizle,<br>{{site_adi}}")}`
    ),
  },
  {
    key: "contact_admin",
    title: "Firmaya: Yeni talep bildirimi",
    description: "Formdan talep gelince firmanın e-posta adresine (info@) gönderilir.",
    vars: {
      ad: "Müşterinin adı",
      eposta: "Müşterinin e-postası",
      telefon: "Müşterinin telefonu",
      mesaj: "Yazdığı mesaj",
      tarih: "Gönderilme zamanı",
      panel_url: "Paneldeki mesajlar sayfası",
    },
    subject: "Yeni talep: {{ad}}",
    html: layout(
      `${h1("Siteden yeni bir talep geldi")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;">
${row("Ad soyad", "<strong>{{ad}}</strong>")}
${row("E-posta", "<a href=\"mailto:{{eposta}}\" style=\"color:#b34a25;\">{{eposta}}</a>")}
${row("Telefon", "<a href=\"tel:{{telefon}}\" style=\"color:#b34a25;\">{{telefon}}</a>")}
${row("Mesaj", "{{mesaj}}")}
${row("Tarih", "{{tarih}}")}
</table>
${p("Randevu tarih ve saatini panelden belirlediğinizde müşteriye otomatik e-posta gider.")}
${button("{{panel_url}}", "Panelde aç")}`
    ),
  },
  {
    key: "appointment_customer",
    title: "Müşteriye: Randevu bilgisi",
    description: "Panelde mesaja randevu tarihi ve saati verilince müşteriye gönderilir. Takvime eklenebilir davet (.ics) eklenir.",
    vars: {
      ad: "Müşterinin adı",
      randevu_tarih: "Randevu günü (ör. 12 Kasım 2026 Perşembe)",
      randevu_saat: "Randevu saati (ör. 14:30)",
      randevu_not: "Panelde yazılan not",
    },
    subject: "Randevunuz: {{randevu_tarih}} {{randevu_saat}} — {{site_adi}}",
    html: layout(
      `${h1("Randevunuz oluşturuldu")}
${p("Merhaba {{ad}}, sizinle görüşmeyi sabırsızlıkla bekliyoruz. Randevu bilgileriniz aşağıda:")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background:#153a34;color:#ffffff;">
  <tr><td style="padding:22px 24px;">
    <div style="font-size:11px;letter-spacing:3px;color:#c9957d;text-transform:uppercase;">Tarih</div>
    <div style="font-size:20px;font-weight:300;margin:4px 0 14px;">{{randevu_tarih}}</div>
    <div style="font-size:11px;letter-spacing:3px;color:#c9957d;text-transform:uppercase;">Saat</div>
    <div style="font-size:20px;font-weight:300;margin-top:4px;">{{randevu_saat}}</div>
  </td></tr>
</table>
${p("{{randevu_not}}")}
${p("<strong>Adres:</strong> {{firma_adres}}")}
${button("{{harita_url}}", "Yol tarifi al")}
${p("Saati değiştirmeniz gerekirse lütfen <a href=\"tel:{{firma_telefon}}\" style=\"color:#b34a25;\">{{firma_telefon}}</a> numarasından bize haber verin. Takviminize eklemek için ekteki dosyayı açabilirsiniz.")}`
    ),
  },
  {
    key: "newsletter_welcome",
    title: "Bülten: Hoş geldiniz",
    description: "Sitede bültene kaydolan kişiye otomatik gönderilir.",
    vars: { eposta: "Abonenin e-postası", iptal_url: "Abonelikten çıkma bağlantısı" },
    subject: "{{site_adi}} bültenine hoş geldiniz",
    html: layout(
      `${h1("Aramıza hoş geldiniz")}
${p("Bültenimize kaydolduğunuz için teşekkür ederiz. Yeni koleksiyonlar, tamamlanan projeler ve malzeme rehberlerimizi ara sıra, sizi yormadan paylaşacağız.")}
${button("{{site_url}}", "Koleksiyonları gör")}`,
      `<br><br>Bu e-postayı {{eposta}} adresi bültene kaydolduğu için aldınız. <a href="{{iptal_url}}" style="color:#7a7f87;">Abonelikten çık</a>`
    ),
  },
];

export const templateDef = (key: string) => TEMPLATES.find((t) => t.key === key);

/** Önizleme ve test maili için örnek değerler */
export const SAMPLE_VARS: Record<string, string> = {
  ad: "Ayşe Yılmaz",
  eposta: "ayse@ornek.com",
  telefon: "+90 532 000 00 00",
  mesaj: "Merhaba, 4x3 m mutfağımız için ada mutfak düşünüyoruz.\nHafta içi akşam saatlerinde ulaşabilirsiniz.",
  tarih: "10 Kasım 2026 14:05",
  panel_url: "#",
  randevu_tarih: "12 Kasım 2026 Perşembe",
  randevu_saat: "14:30",
  randevu_not: "Showroom'umuzda numuneler hazır olacak. Mutfağınızın ölçülerini getirirseniz harika olur.",
  iptal_url: "#",
};
