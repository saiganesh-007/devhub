import type { Metadata } from "next";
import Link from "next/link";
import { RegisterMascot } from "@/components/register-mascot";
import { RegisterForm } from "@/components/register-form";
import "../login/login.css";
import "./register.css";

export const metadata: Metadata = { title: "Create account" };

export default function Register() {
  return (
    <main id="login-root" className="register-mode">
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
          <RegisterMascot />
        </section>

        <section className="login-panel" aria-label="Create your DevHub account">
          <h1 className="login-title">Create your account</h1>
          <p className="register-sub">
            Start building your private developer research workspace.
          </p>
          <RegisterForm />
        </section>
      </div>
    </main>
  );
}
