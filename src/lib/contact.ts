// Hermoza iletişim bilgileri — Facebook sayfasındaki bilgilerden alındı.
// Değişirse sadece burayı güncellemek yeterli.
export const contact = {
  phone: "+90 543 103 93 93",
  phoneHref: "tel:+905431039393",
  whatsappHref: "https://wa.me/905431039393",
  email: "info@hermoza.com.tr",
  emailHref: "mailto:info@hermoza.com.tr",
  address: "Nato, Ünalan Sk. No:7/A, Dudullu, Ümraniye / İstanbul",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Ünalan Sk. No:7/A Dudullu Ümraniye İstanbul"),
  facebookHref: "https://facebook.com/hermozakitchenateiler",
} as const;
