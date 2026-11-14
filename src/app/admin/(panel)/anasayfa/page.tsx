import { requireAdmin } from "@/lib/session";
import { readSetting } from "@/lib/content";
import { saveHome } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { MediaField } from "@/components/admin/media-field";
import { Card, PageHead, TextArea, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function HomeSettingsPage() {
  await requireAdmin();
  const h = await readSetting("home");

  return (
    <ActionForm action={saveHome} className="stack">
      <PageHead title="Ana Sayfa" description="Hero videosu, video bandı ve bölüm başlıkları." />

      <div className="alert alert--info">
        Videoları yüklemeden önce sıkıştırın: masaüstü için 1080p, mobil için 720p MP4.
        Projede hazır komut var: <code>npm run video:hero -- video.mp4</code>
      </div>

      <Card title="Hero videosu" sub="Sayfanın en üstünde, tam ekran dönen video">
        <div className="grid-3">
          <MediaField kind="video" name="hero.desktop" label="Masaüstü video" defaultValue={h.hero.desktop} />
          <MediaField kind="video" name="hero.mobile" label="Mobil video" defaultValue={h.hero.mobile} hint="Boşsa masaüstü videosu kullanılır." />
          <MediaField name="hero.poster" label="Poster görseli" defaultValue={h.hero.poster} hint="Video yüklenene kadar görünür." />
        </div>
      </Card>

      <Card title="Video bandı" sub="Koleksiyonların altındaki arka planı videolu bölüm">
        <div className="stack">
          <div className="grid-2">
            <TextField label="Üst etiket" name="bespoke.eyebrow" defaultValue={h.bespoke.eyebrow} />
            <TextField label="Vurgulanan kısım" name="bespoke.highlight" defaultValue={h.bespoke.highlight} hint="Başlıktaki bu kelimeler farklı renkte görünür. Başlıkta birebir geçmeli." />
          </div>
          <TextArea label="Başlık" name="bespoke.heading" defaultValue={h.bespoke.heading} rows={3} />
          <TextArea label="Açıklama" name="bespoke.text" defaultValue={h.bespoke.text} rows={2} />
          <div className="grid-2">
            <TextField label="Buton yazısı" name="bespoke.buttonLabel" defaultValue={h.bespoke.buttonLabel} />
            <TextField label="Buton bağlantısı" name="bespoke.buttonHref" defaultValue={h.bespoke.buttonHref} />
          </div>
          <div className="grid-3">
            <MediaField kind="video" name="bespoke.video.desktop" label="Masaüstü video" defaultValue={h.bespoke.video.desktop} />
            <MediaField kind="video" name="bespoke.video.mobile" label="Mobil video" defaultValue={h.bespoke.video.mobile} />
            <MediaField name="bespoke.video.poster" label="Poster görseli" defaultValue={h.bespoke.video.poster} />
          </div>
        </div>
      </Card>

      <Card title="Koleksiyonlar bölümü" sub="Koleksiyonların kendisi “Koleksiyonlar” sayfasından yönetilir.">
        <div className="grid-2">
          <div className="stack">
            <TextField label="Üst etiket" name="collections.eyebrow" defaultValue={h.collections.eyebrow} />
            <TextField label="Başlık" name="collections.title" defaultValue={h.collections.title} />
          </div>
          <TextArea label="Açıklama" name="collections.text" defaultValue={h.collections.text} rows={4} />
        </div>
      </Card>

      <div className="grid-2">
        <Card title="Blog bölümü" sub="Ana sayfadaki yazı kartları ve /blog sayfasının başlığı">
          <div className="stack">
            <TextField label="Üst etiket" name="journal.eyebrow" defaultValue={h.journal.eyebrow} />
            <TextField label="Başlık" name="journal.title" defaultValue={h.journal.title} />
          </div>
        </Card>
        <Card title="İletişim bölümü">
          <div className="stack">
            <TextField label="Üst etiket" name="contact.eyebrow" defaultValue={h.contact.eyebrow} />
            <TextField label="Başlık" name="contact.title" defaultValue={h.contact.title} />
            <TextArea label="Açıklama" name="contact.text" defaultValue={h.contact.text} rows={2} />
          </div>
        </Card>
      </div>

      <div className="card"><FormFooter /></div>
    </ActionForm>
  );
}
