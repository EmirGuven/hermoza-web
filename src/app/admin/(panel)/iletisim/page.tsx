import { requireAdmin } from "@/lib/session";
import { readSetting } from "@/lib/content";
import { saveContact } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { Card, PageHead, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function ContactPage() {
  await requireAdmin();
  const c = await readSetting("contact");

  return (
    <ActionForm action={saveContact} className="stack">
      <PageHead
        title="İletişim Bilgileri"
        description="İletişim bölümünde, tam ekran menüde ve footer'da görünür."
      />
      <Card title="Bilgiler">
        <div className="stack">
          <div className="grid-2">
            <TextField label="Telefon" name="phone" defaultValue={c.phone} placeholder="+90 5xx xxx xx xx" />
            <TextField label="E-posta" name="email" type="email" defaultValue={c.email} />
          </div>
          <TextArea label="Adres" name="address" defaultValue={c.address} rows={2} />
          <TextField
            label="Harita bağlantısı"
            name="mapsUrl"
            defaultValue={c.mapsUrl}
            hint="Google Haritalar'da işletmenizi açıp “Paylaş” bağlantısını yapıştırın. Adrese tıklayınca bu açılır."
          />
        </div>
      </Card>
      <Card title="Sosyal medya" sub="Boş bırakılanlar sitede gösterilmez">
        <div className="grid-3">
          <TextField label="Facebook" name="facebook" defaultValue={c.facebook} placeholder="https://facebook.com/…" />
          <TextField label="Instagram" name="instagram" defaultValue={c.instagram} placeholder="https://instagram.com/…" />
          <TextField label="WhatsApp numarası" name="whatsapp" defaultValue={c.whatsapp} placeholder="+90 5xx xxx xx xx" />
        </div>
      </Card>
      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
