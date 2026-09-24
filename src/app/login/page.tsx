import type { Metadata } from "next";
import Link from "next/link";
import { LoginMascot } from "@/components/login-mascot";
import { LoginForm } from "@/components/login-form";
import "./login.css";

export const metadata: Metadata = { title: "Sign in" };

export default function Login() {
  return (
    <main id="login-root">
      <div className="login-atmosphere" aria-hidden="true">
        <div className="login-grid-bg" />
        <div className="login-noise" />
        <div className="login-light-cyan" />
        <div className="login-light-violet" />
      </div>

      <header className="login-top">
        <Link href="/" className="login-brand" aria-label="DevHub home">
          <span className="login-brand-mark" aria-hidden="true">
            {"</>"}
          </span>
          <span className="login-brand-word">DevHub</span>
        </Link>
        <Link href="/" className="login-home">
          Back to home
        </Link>
      </header>

      <div className="login-grid">
        <section className="login-visual" aria-label="DevHub mascot">
          <LoginMascot />
        </section>

        <section className="login-panel" aria-label="Sign in to DevHub">
          <h1 className="login-title">Sign in</h1>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
