import { requireAdmin } from "@/lib/session";
import { readSetting } from "@/lib/content";
import { saveGeneral } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { LinksEditor } from "@/components/admin/links-editor";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, Switch, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function GeneralPage() {
  await requireAdmin();
  const g = await readSetting("general");

  return (
    <ActionForm action={saveGeneral} className="stack">
      <PageHead title="Header & Footer" description="Logo, menü bağlantıları, footer ve arama motoru bilgileri." />

      <Card title="Header">
        <div className="grid-2">
          <MediaField name="logo" label="Logo (ikon)" defaultValue={g.logo} dark hint="Şeffaf zeminli, beyaz PNG önerilir." />
          <MediaField name="menuImage" label="Tam ekran menü görseli" defaultValue={g.menuImage} />
          <TextField label="Sağ üst buton yazısı" name="headerCtaLabel" defaultValue={g.headerCtaLabel} />
          <TextField label="Sağ üst buton bağlantısı" name="headerCtaHref" defaultValue={g.headerCtaHref} hint="Sayfa içi bölüm için #iletisim gibi yazın." />
        </div>
      </Card>

      <Card title="Menü bağlantıları" sub="Header'daki “Menü” açılınca görünen bağlantılar">
        <LinksEditor name="menuLinks" label="Bağlantılar" defaultValue={g.menuLinks} />
      </Card>

      <Card title="Footer">
        <div className="stack">
          <LinksEditor name="footerLinks" label="Footer bağlantıları" defaultValue={g.footerLinks} />
          <div className="grid-2">
            <TextField label="Telif yazısı" name="footerCopyright" defaultValue={g.footerCopyright} />
            <div className="field" style={{ justifyContent: "flex-end", paddingBottom: 6 }}>
              <Switch name="newsletterEnabled" label="Bülten kayıt alanını göster" defaultChecked={g.newsletterEnabled} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Arama motoru (SEO)">
        <div className="stack">
          <div className="grid-2">
            <TextField label="Site adı" name="siteName" defaultValue={g.siteName} />
            <TextField label="Sayfa başlığı" name="seoTitle" defaultValue={g.seoTitle} hint="Tarayıcı sekmesinde ve Google sonuçlarında görünür." />
          </div>
          <TextArea label="Açıklama" name="seoDescription" defaultValue={g.seoDescription} hint="Google sonuçlarında başlığın altında görünür, 150–160 karakter ideal." />
        </div>
      </Card>

      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
