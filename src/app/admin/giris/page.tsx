import type { Metadata } from "next";
import { getSetting } from "@/lib/content";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage() {
  const { hero } = await getSetting("home");
  return (
    <div className="adm">
      <div className="auth">
        <div className="auth__side">
          {/* Sitedeki hero videosu (panelden değiştirilir) */}
          <video
            className="bg"
            src={hero.desktop}
            poster={hero.poster || undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div className="shade" />
        </div>
        <div className="auth__main">
          <div className="auth__box">
            <div className="auth__brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/media/brand/hermoza-icon-green.png" alt="" />
              <div>
                <div className="auth__brand-name">HERMOZA</div>
                <div className="auth__brand-sub">YÖNETİM PANELİ</div>
              </div>
            </div>
            <h1>Giriş yap</h1>
            <p className="muted" style={{ marginBottom: 24 }}>
              Site içeriğini yönetmek için hesabınızla giriş yapın.
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
