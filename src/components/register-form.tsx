"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff } from "lucide-react";
import { safeInternalPath } from "@/lib/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

type MoodMsg =
  | "idle"
  | "password"
  | "peek"
  | "button"
  | "loading"
  | "error"
  | "success"
  | "match"
  | "mismatch"
  | "valid";

function sendMood(mood: MoodMsg) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("devhub:register-mood", { detail: mood }));
  }
}

function safeAuthError(message: string) {
  if (/invalid login/i.test(message)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(message))
    return "Verify your email before signing in.";
  return message;
}

/**
 * Register-only form. Same Supabase signup / verification / redirect
 * behavior as the shared auth form's register mode, plus a compact live
 * password-requirements list and confirm-match states. Focus moods
 * (name/email/password/confirm) are owned by the register mascot's focus
 * tracking; the form emits validation moods (match/mismatch/valid) and
 * transient moods (button/loading/error/success/peek).
 */
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const reqLength = password.length >= 8;
  const reqCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const reqNumber = /[0-9]/.test(password);
  const confirmTouched = confirm.length > 0;
  const match = confirmTouched && password === confirm && password.length > 0;
  const mismatch = confirmTouched && password !== confirm;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const valid =
    name.trim().length >= 2 &&
    emailValid &&
    reqLength &&
    reqCase &&
    reqNumber &&
    match;

  // Live validation moods for the mascot. The mascot guards priority
  // itself (privacy owns active typing; loading/error/success own submit),
  // so emitting here is always safe.
  useEffect(() => {
    if (pending) return;
    if (valid) sendMood("valid");
    else if (match) sendMood("match");
    else if (mismatch) sendMood("mismatch");
  }, [valid, match, mismatch, pending]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    sendMood("loading");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const pw = String(form.get("password") || "");
    const cf = String(form.get("confirm") || "");
    const supabase = createSupabaseBrowser();

    if (!supabase) {
      setError(
        "Authentication is not configured yet. Add the Supabase URL and publishable key to .env.local.",
      );
      sendMood("error");
      setPending(false);
      return;
    }

    if (pw !== cf) {
      setError("Passwords do not match.");
      sendMood("error");
      setPending(false);
      return;
    }

    const result = await supabase.auth.signUp({
      email,
      password: pw,
      options: { data: { display_name: String(form.get("name") || "") } },
    });

    if (result.error) {
      setError(safeAuthError(result.error.message));
      sendMood("error");
    } else if (!result.data.session) {
      sendMood("success");
      router.push(`/verify-email?email=${encodeURIComponent(email)}&flow=signup`);
    } else {
      sendMood("success");
      const next = safeInternalPath(
        new URLSearchParams(window.location.search).get("next"),
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
        <span className="login-label">Name</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="login-input"
          placeholder="Ada Lovelace"
        />
      </label>

      <label className="login-field">
        <span className="login-label">Email address</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          placeholder="you@example.com"
        />
      </label>

      <div className="login-field">
        <label className="login-label" htmlFor="register-password">
          Password
        </label>
        <span className="login-password">
          <input
            id="register-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input login-input-password"
            placeholder="Minimum 8 characters"
            aria-describedby="register-pw-reqs"
          />
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={
              showPassword ? "Hide passwords" : "Show passwords"
            }
            aria-pressed={showPassword}
            className="login-visibility"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
        <ul id="register-pw-reqs" className="pw-req" aria-label="Password requirements">
          <Req ok={reqLength} label="8+ characters" />
          <Req ok={reqCase} label="Uppercase & lowercase" />
          <Req ok={reqNumber} label="Number" />
        </ul>
      </div>

      <div className="login-field">
        <label className="login-label" htmlFor="register-confirm">
          Confirm password
        </label>
        <span className="login-password">
          <input
            id="register-confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`login-input login-input-password${match ? " is-match" : mismatch ? " is-mismatch" : ""}`}
            placeholder="Repeat your password"
            aria-describedby="register-confirm-hint"
            aria-invalid={mismatch}
          />
          <button
            type="button"
            onClick={toggleVisibility}
            aria-label={
              showPassword ? "Hide passwords" : "Show passwords"
            }
            aria-pressed={showPassword}
            className="login-visibility"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
        {confirmTouched && (
          <p
            id="register-confirm-hint"
            className={`pw-hint${match ? " is-ok" : " is-warn"}`}
            aria-live="polite"
          >
            {match && <Check size={12} aria-hidden="true" />}
            {match ? "Passwords match." : "Passwords do not match yet."}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" id="register-error" className="login-error">
          {error}
        </p>
      )}

      <button
        id="register-submit"
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
        ) : (
          "Create account"
        )}
      </button>

      <p className="login-switch">
        Already have an account?{" "}
        <Link href="/login" className="login-link-strong">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Req({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li data-ok={ok} aria-label={`${label}: ${ok ? "satisfied" : "not yet"}`}>
      <span className="pw-dot" aria-hidden="true">
        {ok && <Check size={10} />}
      </span>
      {label}
    </li>
  );
}
