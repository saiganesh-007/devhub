"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") || "");
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      setMessage("Authentication is not configured yet.");
      setPending(false);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    setMessage(
      error
        ? error.message
        : "If an account exists for that email, a recovery message is on its way.",
    );
    setPending(false);
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-xs font-medium text-ink2">
        Email address
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="auth-input mt-2"
          placeholder="you@example.com"
        />
      </label>
      {message && (
        <p role="status" className="border-l-2 border-ok bg-ok/5 px-4 py-3 text-sm text-ink2">
          {message}
        </p>
      )}
      <button disabled={pending} className="auth-primary">
        {pending ? "Sending…" : "Send recovery email"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [ready, setReady] = useState<"checking" | "ready" | "invalid">("checking");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowser();
      if (!supabase) {
        setReady("invalid");
        setMessage("Authentication is not configured yet.");
        return;
      }
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) throw error;
        }
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setReady("invalid");
          setMessage("This recovery link is missing a working session.");
          return;
        }
        setReady("ready");
      } catch (e) {
        setReady("invalid");
        setMessage(
          e instanceof Error && /expired/i.test(e.message)
            ? "This recovery link has expired. Request a new one."
            : "This recovery link is invalid or was already used. Request a new one.",
        );
      }
    }
    void init();
  }, [params]);

  if (ready === "checking") {
    return (
      <p className="mt-8 flex items-center gap-2 text-sm text-ink3">
        <LoaderCircle size={16} className="animate-spin" />
        Checking recovery session…
      </p>
    );
  }

  if (ready === "invalid") {
    return (
      <div className="mt-8 rounded-xl border border-err/30 bg-err/5 p-6 text-center">
        <LockKeyhole size={24} className="mx-auto text-err" />
        <p className="mt-3 text-sm font-medium text-ink">{message}</p>
        <Link
          href="/forgot-password"
          className="btn btn-primary mt-6 inline-flex"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    const supabase = createSupabaseBrowser();
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }
    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setPending(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {["password", "confirm"].map((name, index) => (
        <label key={name} className="block text-xs font-medium text-ink2">
          {index ? "Confirm password" : "New password"}
          <span className="relative mt-2 block">
            <input
              name={name}
              type={visible ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              required
              className="auth-input pr-12"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-label="Toggle password visibility"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink3 transition-colors hover:text-ink"
            >
              {visible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
      ))}
      {error && (
        <p role="alert" className="border-l-2 border-err bg-err/5 px-4 py-3 text-sm text-err">
          {error}
        </p>
      )}
      <button disabled={pending} className="auth-primary">
        {pending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}