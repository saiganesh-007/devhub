import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/password-recovery";

export const metadata: Metadata = { title: "Set new password" };

export default function Reset() {
  return (
    <AuthShell
      eyebrow="Secure recovery"
      title="Choose a new password."
      description="Use at least eight characters and avoid passwords reused on other services."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}