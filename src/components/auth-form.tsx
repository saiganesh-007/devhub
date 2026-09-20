"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import { safeInternalPath } from "@/lib/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

function notifyAuthError() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("devhub:auth-error"));
  }
}

function notifyPasswordFocus(focused: boolean) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new Event(focused ? "devhub:password-focus" : "devhub:password-blur"),
    );
  }
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpLogin, setOtpLogin] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    const supabase = createSupabaseBrowser();

    if (!supabase) {
      setError(
        "Authentication is not configured yet. Add the Supabase URL and publishable key to .env.local.",
      );
      notifyAuthError();
      setPending(false);
      return;
    }

    if (mode === "register" && password !== confirm) {
      setError("Passwords do not match.");
      notifyAuthError();
      setPending(false);
      return;
    }

    if (otpLogin) {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (otpError) {
        setError(otpError.message);
        notifyAuthError();
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email)}&flow=magiclink`);
      }
      setPending(false);
      return;
    }

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: String(form.get("name") || "") } },
          });

    if (result.error) {
      setError(safeAuthError(result.error.message));
      notifyAuthError();
    } else if (mode === "register" && !result.data.session) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}&flow=signup`);
    } else {
      window.dispatchEvent(new Event("devhub:auth-success"));
      const next = safeInternalPath(
        new URLSearchParams(window.location.search).get("next"),
      );
      router.push(next);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={pending}>
      {mode === "register" && (
        <Field label="Name">
          <input
            name="name"
            autoComplete="name"
            minLength={2}
            required
            className="auth-input"
            placeholder="Ada Lovelace"
          />
        </Field>
      )}

      <Field label="Email address">
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="auth-input"
          placeholder="you@example.com"
        />
      </Field>

      {!otpLogin && (
        <>
          <Field label="Password">
            <PasswordInput
              name="password"
              visible={showPassword}
              toggle={() => setShowPassword((v) => !v)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              onFocusToggle={notifyPasswordFocus}
            />
          </Field>
          {mode === "register" && (
            <Field label="Confirm password">
              <PasswordInput
                name="confirm"
                visible={showPassword}
                toggle={() => setShowPassword((v) => !v)}
                autoComplete="new-password"
                onFocusToggle={notifyPasswordFocus}
              />
            </Field>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="border-l-2 border-err bg-err/5 px-4 py-3 text-sm text-err">
          {error}
        </p>
      )}

      <button disabled={pending} className="auth-primary">
        {pending
          ? "Please wait…"
          : otpLogin
            ? "Send email code"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
      </button>

      {mode === "login" && (
        <div className="flex items-center justify-between gap-4 text-xs">
          <Link
            href="/forgot-password"
            className="text-ink3 transition-colors hover:text-ink"
          >
            Forgot password?
          </Link>
          <button
            type="button"
            onClick={() => {
              setOtpLogin((v) => !v);
              setError("");
            }}
            className="inline-flex items-center gap-2 text-brand1 transition-colors hover:text-brand2"
          >
            <Mail size={13} />
            {otpLogin ? "Use password" : "Sign in with email code"}
          </button>
        </div>
      )}

      <p className="border-t border-line pt-5 text-sm text-ink3">
        {mode === "login" ? "New to DevHub? " : "Already have an account? "}
        <Link
          href={mode === "login" ? "/register" : "/login"}
          className="font-medium text-ink transition-colors hover:text-brand1"
        >
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-ink2">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function PasswordInput({
  name,
  visible,
  toggle,
  autoComplete,
  onFocusToggle,
}: {
  name: string;
  visible: boolean;
  toggle: () => void;
  autoComplete: string;
  onFocusToggle: (focused: boolean) => void;
}) {
  return (
    <span className="relative block">
      <input
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        minLength={8}
        required
        className="auth-input pr-12"
        placeholder="Minimum 8 characters"
        onFocus={() => onFocusToggle(true)}
        onBlur={() => onFocusToggle(false)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink3 transition-colors hover:text-ink"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </span>
  );
}

function safeAuthError(message: string) {
  if (/invalid login/i.test(message)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(message))
    return "Verify your email before signing in.";
  return message;
}
