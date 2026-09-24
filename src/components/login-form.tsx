"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail } from "lucide-react";
import { safeInternalPath } from "@/lib/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

function sendMood(
  mood:
    | "idle"
    | "email"
    | "recognized"
    | "password"
    | "peek"
    | "button"
    | "loading"
    | "error"
    | "success",
) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("devhub:login-mood", { detail: mood }));
  }
}

function safeAuthError(message: string) {
  if (/invalid login/i.test(message)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(message))
    return "Verify your email before signing in.";
  return message;
}

/**
 * Login-only form. Same backend/validation/session behavior as the shared
 * auth form's login mode, plus mascot mood events. Register page untouched.
 */
export function LoginForm() {
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
    sendMood("loading");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const supabase = createSupabaseBrowser();

    if (!supabase) {
      setError(
        "Authentication is not configured yet. Add the Supabase URL and publishable key to .env.local.",
      );
      sendMood("error");
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
        sendMood("error");
      } else {
        sendMood("success");
        router.push(
          `/verify-email?email=${encodeURIComponent(email)}&flow=magiclink`,
        );
      }
      setPending(false);
      return;
    }

    const result = await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setError(safeAuthError(result.error.message));
      sendMood("error");
    } else {
      sendMood("success");
      let fallback = "/dashboard";
      try {
        const stored = window.localStorage.getItem("devhub:search-prefs");
        const parsed = stored ? (JSON.parse(stored) as { defaultLanding?: string }) : null;
        if (
          parsed?.defaultLanding === "/dashboard" ||
          parsed?.defaultLanding === "/search" ||
          parsed?.defaultLanding === "/favourites"
        ) {
          fallback = parsed.defaultLanding;
        }
      } catch {
        // Keep dashboard fallback.
      }
      const next = safeInternalPath(
        new URLSearchParams(window.location.search).get("next"),
        fallback,
      );
      router.push(next);
      router.refresh();
    }
    setPending(false);
  }

  function toggleVisibility() {
    const next = !showPassword;
    setShowPassword(next);
    if (next) sendMood("peek");
    else {
      const ae = document.activeElement;
      if (ae instanceof HTMLInputElement && ae.name === "password")
        sendMood("password");
      else sendMood("idle");
    }
  }

  return (
    <form onSubmit={submit} className="login-form" aria-busy={pending}>
      <label className="login-field">
        <span className="login-label">Email address</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="login-input"
          placeholder="you@example.com"
        />
      </label>

      {!otpLogin && (
        <label className="login-field">
          <span className="login-label">Password</span>
          <span className="login-password">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              minLength={8}
              required
              className="login-input login-input-password"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={toggleVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="login-visibility"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="login-error">
          {error}
        </p>
      )}

      <button
        id="login-submit"
        disabled={pending}
        className="login-primary"
        onPointerEnter={() => {
          if (!pending) sendMood("button");
        }}
        onFocus={() => {
          if (!pending) sendMood("button");
        }}
      >
        {pending ? (
          <span className="login-loading">
            <span className="login-spinner" aria-hidden="true" />
            Please wait…
          </span>
        ) : otpLogin ? (
          "Send email code"
        ) : (
          "Sign in"
        )}
      </button>

      <div className="login-meta">
        <Link href="/forgot-password" className="login-link-muted">
          Forgot password?
        </Link>
        <button
          type="button"
          onClick={() => {
            setOtpLogin((v) => !v);
            setError("");
            sendMood("idle");
          }}
          className="login-link-brand"
        >
          <Mail size={13} />
          {otpLogin ? "Use password" : "Sign in with email code"}
        </button>
      </div>

      <p className="login-switch">
        New to DevHub?{" "}
        <Link href="/register" className="login-link-strong">
          Create an account
        </Link>
      </p>
    </form>
  );
}
