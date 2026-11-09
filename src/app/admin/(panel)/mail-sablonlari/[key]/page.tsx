import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { COMMON_VARS, SAMPLE_VARS, templateDef, type TemplateKey } from "@/lib/mail-templates";
import { commonVars, loadTemplate, siteUrl } from "@/lib/mail";
import { TemplateEditor } from "./template-editor";

// Panel sayfası her istekte oturumu okur (anında gezinme denetimi dışında)
export const instant = false;

export default async function TemplateEditPage({ params }: { params: Promise<{ key: string }> }) {
  const admin = await requireAdmin();
  const { key } = await params;
  const def = templateDef(key);
  if (!def) notFound();
  const tpl = await loadTemplate(def.key as TemplateKey);
  const preview = {
    ...(await commonVars()),
    ...SAMPLE_VARS,
    panel_url: `${siteUrl()}/admin/mesajlar`,
    iptal_url: `${siteUrl()}/bulten/iptal`,
  };

  return (
    <TemplateEditor
      def={{ key: def.key, title: def.title, description: def.description, vars: def.vars }}
      commonVars={COMMON_VARS}
      initial={tpl}
      defaults={{ subject: def.subject, html: def.html }}
      previewVars={preview}
      testTo={process.env.MAIL_ADMIN_TO ?? admin.email}
    />
  );
}
