"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { MAX_OTP_LENGTH, MIN_OTP_LENGTH, normalizeOtp, resolveOtpLength } from "@/lib/otp";

export function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") || "";
  const flow = params.get("flow") === "signup" ? "signup" : "magiclink";

  const [digits, setDigits] = useState<string[]>(Array(MAX_OTP_LENGTH).fill(""));
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => value - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const token = normalizeOtp(digits.join(""));
  const validLength = resolveOtpLength(token) !== null;

  function update(index: number, value: string) {
    const clean = normalizeOtp(value);
    if (clean.length > 1) {
      fillCode(clean);
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");
    if (clean && index < MAX_OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function fillCode(raw: string) {
    const code = normalizeOtp(raw);
    const next = Array(MAX_OTP_LENGTH).fill("");
    code.split("").forEach((value, index) => (next[index] = value));
    setDigits(next);
    setError("");
    inputs.current[Math.max(0, Math.min(code.length, MAX_OTP_LENGTH) - 1)]?.focus();
  }

  function key(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) next[index] = "";
      else if (index > 0) {
        next[index - 1] = "";
        inputs.current[index - 1]?.focus();
      }
      setDigits(next);
      setError("");
    } else if (event.key === "ArrowLeft") {
      inputs.current[Math.max(0, index - 1)]?.focus();
    } else if (event.key === "ArrowRight") {
      inputs.current[Math.min(MAX_OTP_LENGTH - 1, index + 1)]?.focus();
    }
  }

  function paste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    fillCode(event.clipboardData.getData("text"));
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    if (status === "loading") return;
    if (!email || !validLength) {
      setError(`Enter the complete ${MIN_OTP_LENGTH}–${MAX_OTP_LENGTH} digit code.`);
      return;
    }
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      setError("Authentication configuration is unavailable. Check the public Supabase environment values.");
      return;
    }
    setStatus("loading");
    setError("");
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (verifyError) {
      setStatus("idle");
      setError(
        /expired/i.test(verifyError.message)
          ? "This code has expired. Request a new one."
          : "That code is invalid. Check the email and try again.",
      );
      window.dispatchEvent(new Event("devhub:auth-error"));
      return;
    }
    setStatus("success");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 650);
  }

  async function resend() {
    if (cooldown > 0 || status === "loading" || !email) return;
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      setError("Authentication configuration is unavailable.");
      return;
    }
    setError("");
    const result =
      flow === "signup"
        ? await supabase.auth.resend({ type: "signup", email })
        : await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
    if (result.error) setError(result.error.message);
    else setCooldown(60);
  }

  if (status === "success") {
    return (
      <div role="status" className="card-surface mt-8 flex flex-col items-center gap-3 p-8 text-center">
        <CheckCircle2 size={28} className="text-ok" />
        <strong className="text-ink">Email verified</strong>
        <p className="text-sm text-ink3">Opening your intelligence workspace…</p>
      </div>
    );
  }

  return (
    <form onSubmit={verify} className="mt-8">
      <p className="text-sm text-ink3">
        Code sent to{" "}
        <strong className="font-medium text-ink">{email || "your email"}</strong>
      </p>
      <fieldset className="mt-6">
        <legend className="sr-only">Email verification code</legend>
        <div className="grid grid-cols-8 gap-2 max-[430px]:gap-1">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              value={digit}
              onChange={(event) => update(index, event.target.value)}
              onKeyDown={(event) => key(index, event)}
              onPaste={paste}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              aria-label={`Code digit ${index + 1} of ${MAX_OTP_LENGTH}`}
              className="h-14 w-full min-w-0 rounded-lg border border-line bg-bg1 text-center font-mono text-lg text-ink transition-colors focus:border-brand1 focus:outline-none focus:ring-2 focus:ring-brand1/30"
            />
          ))}
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-ink3">
          Supports 6–8 digit Supabase codes
        </p>
      </fieldset>

      {error && (
        <p role="alert" className="mt-5 border-l-2 border-err bg-err/5 px-4 py-3 text-sm text-err">
          {error}
        </p>
      )}

      <button disabled={status === "loading" || !validLength} className="auth-primary mt-6">
        {status === "loading" ? "Verifying…" : "Verify email"}
      </button>
      <button
        type="button"
        onClick={resend}
        disabled={cooldown > 0 || status === "loading"}
        className="mt-4 inline-flex items-center gap-2 text-sm text-ink3 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw size={14} />
        {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend code"}
      </button>
    </form>
  );
}