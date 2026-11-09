"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock, LogIn, User } from "lucide-react";
import { login, type ActionState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={pending}>
      {pending ? <span className="spinner" /> : <LogIn />} Giriş yap
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useActionState<ActionState, FormData>(login, {});
  return (
    <form action={action} className="col" style={{ gap: 14 }}>
      {state.error && <div className="alert alert--danger">{state.error}</div>}
      <label className="field">
        <span className="label">Kullanıcı adı</span>
        <span className="input-wrap">
          <User />
          <input
            className="input"
            name="email"
            type="text"
            key={state.at}
            defaultValue={state.values?.email}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            autoFocus={!state.values?.email}
          />
        </span>
      </label>
      <label className="field">
        <span className="label">Şifre</span>
        <span className="input-wrap">
          <Lock />
          <input
            className="input"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            autoFocus={!!state.values?.email}
          />
        </span>
      </label>
      <Submit />
    </form>
  );
}
