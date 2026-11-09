"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, MailCheck, MailOpen, Trash2, X } from "lucide-react";
import {
  deleteMessage,
  scheduleAppointment,
  setMessageRead,
  setMessageStatus,
  type ActionState,
} from "@/app/admin/actions";
import { useToast } from "@/components/admin/toast";

type Msg = {
  id: number;
  name: string;
  email: string;
  read: boolean;
  status: string;
  appointmentAt: string | null;
  appointmentNote: string;
};

/** ISO tarihten Türkiye saatine göre "YYYY-AA-GG" ve "SS:DD" */
function trParts(iso: string | null) {
  if (!iso) return { date: "", time: "" };
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { date: `${g("year")}-${g("month")}-${g("day")}`, time: `${g("hour")}:${g("minute")}` };
}

function AppointmentModal({ msg, onClose }: { msg: Msg; onClose: () => void }) {
  const initial = trParts(msg.appointmentAt);
  const [state, action, pending] = useActionState<ActionState, FormData>(scheduleAppointment, {});
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!state.at) return;
    if (state.error) toast.error(state.error);
    if (state.ok) {
      toast.success(state.message!);
      router.refresh();
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.at]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form action={action} className="modal" role="dialog" aria-modal="true" style={{ textAlign: "left" }}>
        <input type="hidden" name="id" value={msg.id} />
        <div className="modal__head">
          <div>
            <div className="modal__title">Randevu ver</div>
            <div className="modal__sub">{msg.name}{msg.email ? ` · ${msg.email}` : ""}</div>
          </div>
          <button type="button" className="btn btn--icon btn--text" onClick={onClose} aria-label="Kapat">
            <X />
          </button>
        </div>
        <div className="modal__body stack">
          <div className="grid-2">
            <label className="field">
              <span className="label">Tarih</span>
              <input className="input" type="date" name="date" defaultValue={initial.date} required />
            </label>
            <label className="field">
              <span className="label">Saat</span>
              <input className="input" type="time" name="time" step={900} defaultValue={initial.time || "10:00"} required />
            </label>
          </div>
          <label className="field">
            <span className="label">Müşteriye not (isteğe bağlı)</span>
            <textarea
              className="textarea"
              name="note"
              rows={3}
              defaultValue={msg.appointmentNote}
              placeholder="Ör. Showroom'umuzda numuneler hazır olacak. Mutfak ölçülerinizi getirirseniz harika olur."
            />
          </label>
          <label className="row" style={{ gap: 10, cursor: msg.email ? "pointer" : "not-allowed" }}>
            <span className="switch">
              <input type="checkbox" name="notify" defaultChecked={!!msg.email} disabled={!msg.email} />
              <span className="switch__track" />
            </span>
            <span className="soft">
              {msg.email ? "Müşteriye randevu maili gönder (takvim davetiyle)" : "Müşterinin e-postası yok; mail gönderilemez"}
            </span>
          </label>
        </div>
        <div className="modal__foot">
          <button type="button" className="btn" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? <span className="spinner" /> : <CalendarPlus />} Randevuyu kaydet
          </button>
        </div>
      </form>
    </div>
  );
}

export function MessageActions({ message: msg }: { message: Msg }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const run = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <span className="acts" style={{ opacity: pending ? 0.5 : 1 }}>
      <button
        type="button"
        className="btn btn--sm"
        onClick={() => setOpen(true)}
        title={msg.appointmentAt ? "Randevuyu değiştir" : "Randevu ver"}
      >
        <CalendarPlus /> {msg.appointmentAt ? "Değiştir" : "Randevu"}
      </button>
      {msg.status === "randevu" && (
        <button
          type="button"
          className="btn btn--icon btn--sm btn--text"
          disabled={pending}
          onClick={() => run(() => setMessageStatus(msg.id, "tamamlandi"))}
          title="Tamamlandı işaretle"
        >
          <Check />
        </button>
      )}
      <button
        type="button"
        className="btn btn--icon btn--sm btn--text"
        disabled={pending}
        onClick={() => run(() => setMessageRead(msg.id, !msg.read))}
        title={msg.read ? "Okunmadı işaretle" : "Okundu işaretle"}
      >
        {msg.read ? <MailOpen /> : <MailCheck />}
      </button>
      <button
        type="button"
        className="btn btn--icon btn--sm btn--text btn--danger"
        disabled={pending}
        onClick={() => confirm("Mesaj silinsin mi?") && run(() => deleteMessage(msg.id))}
        title="Sil"
      >
        <Trash2 />
      </button>
      {open && <AppointmentModal msg={msg} onClose={() => setOpen(false)} />}
    </span>
  );
}
