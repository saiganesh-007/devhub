"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand";

export function LandingNav() {
  return (
    <header className="landing-nav">
      <Logo />
      <nav>
        <Link href="/dashboard">Explore</Link>
        <Link href="/search">Search</Link>
        <Link href="/compare">Compare</Link>
      </nav>
      <div>
        <Link href="/login">Sign in</Link>
        <Link className="landing-primary-btn" href="/register">
          <span>Get started</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </header>
  );
}
