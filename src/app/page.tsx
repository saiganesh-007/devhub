import type { Metadata } from "next";
import { LandingPageShell } from "@/components/landing/landing-page-shell";

export const metadata: Metadata = {
  title: "DevHub — Developer intelligence for the open-source world",
  description:
    "Connect GitHub's scattered signals. Understand developers, repositories, activity, technology, and open-source impact with cinematic precision.",
};

export default function Home() {
  return <LandingPageShell />;
}
