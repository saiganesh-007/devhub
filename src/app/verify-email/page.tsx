import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { OtpForm } from "@/components/otp-form";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmail() {
  return (
    <AuthShell
      eyebrow="Identity verification"
      title="Check your inbox."
      description="Enter the 6–8 digit code from your DevHub verification email. Codes are issued and verified securely by Supabase."
    >
      <Suspense fallback={<div className="skeleton mt-8 h-40" />}>
        <OtpForm />
      </Suspense>
    </AuthShell>
  );
}