"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Save, Send } from "lucide-react";
import { resetTemplate, saveTemplate, sendTestMail, type ActionState } from "@/app/admin/actions";
import { useToast } from "@/components/admin/toast";
import { Card, PageHead } from "@/components/admin/ui";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fill = (tpl: string, vars: Record<string, string>, html = true) =>
  tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, k: string) => {
    const v = vars[k] ?? `{{${k}}}`;
    return html ? esc(v).replace(/\r?\n/g, "<br>") : v;
  });

export function TemplateEditor({
  def,
  commonVars,
  initial,
  defaults,
  previewVars,
  testTo,
}: {
  def: { key: string; title: string; description: string; vars: Record<string, string> };
  commonVars: Record<string, string>;
  initial: { subject: string; html: string; enabled: boolean };
  defaults: { subject: string; html: string };
  previewVars: Record<string, string>;
  testTo: string;
}) {
  const [subject, setSubject] = useState(initial.subject);
  const [html, setHtml] = useState(initial.html);
  const [to, setTo] = useState(testTo);
  const [state, action, saving] = useActionState<ActionState, FormData>(saveTemplate, {});
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.at) return;
    if (state.error) toast.error(state.error);
    else if (state.message) toast.success(state.message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.at]);

  const preview = useMemo(() => fill(html, previewVars), [html, previewVars]);
  const allVars = { ...def.vars, ...commonVars };

  function insertVar(name: string) {
    setHtml((h) => h + `{{${name}}}`);
    toast.success(`{{${name}}} HTML'in sonuna eklendi`);
  }

  return (
    <form action={action} className="stack">
      <input type="hidden" name="key" value={def.key} />
      <PageHead title={def.title} description={def.description}>
        <Link href="/admin/mail-sablonlari" className="btn">
          <ArrowLeft /> Şablonlar
        </Link>
      </PageHead>

      <Card>
        <div className="grid-2" style={{ alignItems: "end" }}>
          <label className="field">
            <span className="label">Konu</span>
            <input className="input" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <span className="hint">Önizleme: {fill(subject, previewVars, false)}</span>
          </label>
          <label className="row" style={{ gap: 10, cursor: "pointer", paddingBottom: 26 }}>
            <span className="switch">
              <input type="checkbox" name="enabled" defaultChecked={initial.enabled} />
              <span className="switch__track" />
            </span>
            <span className="soft">Bu mail otomatik gönderilsin</span>
          </label>
        </div>
      </Card>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <Card title="HTML" sub="Mail programları için tablo tabanlı, satır içi stilli HTML önerilir">
          <textarea
            className="textarea"
            name="html"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            spellCheck={false}
            style={{ minHeight: 520, fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: 12, lineHeight: 1.5 }}
          />
          <div className="label" style={{ margin: "14px 0 8px" }}>Değişkenler (tıklayınca eklenir)</div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            {Object.entries(allVars).map(([k, label]) => (
              <button key={k} type="button" className="badge" onClick={() => insertVar(k)} title={label} style={{ cursor: "pointer" }}>
                {`{{${k}}}`}
              </button>
            ))}
          </div>
        </Card>
        <Card title="Önizleme" sub="Örnek verilerle">
          <iframe
            title="Mail önizleme"
            srcDoc={preview}
            sandbox=""
            style={{ width: "100%", height: 640, border: "1px solid var(--border)", background: "#fff" }}
          />
        </Card>
      </div>

      <div className="card">
        <div className="card__foot" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="row">
            <input className="input" style={{ width: 260 }} value={to} onChange={(e) => setTo(e.target.value)} aria-label="Test alıcısı" />
            <button
              type="button"
              className="btn"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await sendTestMail(def.key, to);
                  if (r.ok) toast.success(r.message!);
                  else toast.error(r.error!);
                })
              }
              title="Kaydedilmiş şablonla, örnek verilerle gönderir"
            >
              {pending ? <span className="spinner" /> : <Send />} Test maili gönder
            </button>
          </div>
          <div className="row">
            <button
              type="button"
              className="btn btn--text"
              onClick={() => {
                if (!confirm("Şablon varsayılan haline dönsün mü? Yaptığınız değişiklikler silinir.")) return;
                start(async () => {
                  await resetTemplate(def.key);
                  setSubject(defaults.subject);
                  setHtml(defaults.html);
                  toast.success("Varsayılan şablona dönüldü");
                  router.refresh();
                });
              }}
            >
              <RotateCcw /> Varsayılana dön
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <Save />} Kaydet
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
