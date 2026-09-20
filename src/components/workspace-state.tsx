"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import "@/app/workspace.css";

export function WorkspaceLoading() {
  return <div className="workspace min-h-dvh bg-bg0 text-ink"><main className="app-main" role="status" aria-label="Loading workspace">
    <p className="text-metadata mb-6">DevHub / opening intelligence</p>
    <div className="skeleton h-9 w-64 max-w-full mb-4" /><div className="skeleton h-4 w-96 max-w-full mb-12" />
    <div className="grid grid-cols-2 gap-6 mb-10">{[0,1,2,3].map(i => <div key={i} className="skeleton h-20" />)}</div>
    {[0,1,2].map(i => <div key={i} className="skeleton h-20 mb-4" />)}
    <span className="sr-only">Loading public signals and your workspace.</span>
  </main></div>;
}

export function WorkspaceError({ reset }: { reset: () => void }) {
  return <div className="workspace min-h-dvh bg-bg0 text-ink"><main className="app-main">
    <p className="text-metadata mb-8">DevHub / connection interrupted</p>
    <div className="card-surface card-surface--error" role="alert"><h1 className="text-page-title">This view couldn’t load.</h1><p className="text-body-secondary mt-4">The service may be temporarily unavailable or its request limit may have been reached. Your saved work is unchanged.</p>
      <div className="flex flex-wrap gap-3 mt-6"><button className="btn btn-primary" onClick={reset}><RefreshCw size={15} />Try again</button><Link href="/dashboard" className="btn"><ArrowLeft size={15} />Workspace</Link></div>
    </div>
  </main></div>;
}

export function WorkspaceNotFound() {
  return <div className="workspace min-h-dvh bg-bg0 text-ink"><main className="app-main"><p className="text-metadata mb-8">DevHub / signal not found</p><h1 className="text-page-title">Nothing at this address.</h1><p className="text-body-secondary mt-4">This developer or repository may have moved, become private, or no longer exist.</p><Link href="/search" className="btn btn-primary mt-6"><Search size={15} />Search GitHub</Link></main></div>;
}
