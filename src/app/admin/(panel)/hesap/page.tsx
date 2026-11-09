import { requireAdmin } from "@/lib/session";
import { changePassword } from "@/app/admin/actions";
import { ActionForm, FormFooter } from "@/components/admin/action-form";
import { Card, PageHead, TextField } from "@/components/admin/ui";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <ActionForm action={changePassword} className="stack" >
      <PageHead title="Şifre Değiştir" description={admin.email} />
      <div style={{ maxWidth: 480 }} className="stack">
        <Card>
          <div className="stack">
            <TextField label="Mevcut şifre" name="current" type="password" required />
            <TextField label="Yeni şifre" name="next" type="password" hint="En az 8 karakter." required />
            <TextField label="Yeni şifre (tekrar)" name="again" type="password" required />
          </div>
        </Card>
        <div className="card"><FormFooter /></div>
      </div>
    </ActionForm>
  );
}
