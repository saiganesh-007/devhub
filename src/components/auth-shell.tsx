import Link from "next/link";
import { Activity, Braces, GitBranch, GitCommitHorizontal, Network, Radio } from "lucide-react";
import { Logo } from "@/components/brand";

export function AuthShell({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){
  return <main className="min-h-screen bg-[#060708] text-zinc-100 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(460px,.82fr)]">
    <section className="relative hidden min-h-screen overflow-hidden border-r border-white/8 p-10 lg:flex lg:flex-col">
      <div className="auth-grid absolute inset-0 opacity-70"/><div className="auth-orbit auth-orbit-a"/><div className="auth-orbit auth-orbit-b"/>
      <div className="relative z-10"><Logo/></div>
      <div className="relative z-10 my-auto max-w-2xl"><p className="font-mono text-[11px] uppercase tracking-[.22em] text-lime-300">Open-source signal map</p><h2 className="mt-6 max-w-xl text-5xl font-semibold leading-[.95] tracking-[-.045em]">From scattered activity to connected intelligence.</h2>
        <div className="relative mt-16 h-72" aria-hidden="true"><svg className="absolute inset-0 h-full w-full" viewBox="0 0 640 280"><path className="auth-path" d="M40 144 C130 40 180 235 278 126 S430 30 600 137"/><path className="auth-path auth-path-delay" d="M60 208 C145 115 210 244 322 188 S480 92 580 82"/></svg>
          <Signal className="left-[2%] top-[42%]" icon={<Network/>} label="developer" value="identity"/><Signal className="left-[34%] top-[23%]" icon={<GitBranch/>} label="repositories" value="84 public"/><Signal className="left-[67%] top-[49%]" icon={<Braces/>} label="languages" value="12 signals"/><Signal className="right-[1%] top-[18%]" icon={<Activity/>} label="activity" value="live"/><Signal className="left-[43%] bottom-[1%]" icon={<GitCommitHorizontal/>} label="contributors" value="connected"/>
        </div>
      </div><p className="relative z-10 font-mono text-[10px] uppercase tracking-[.16em] text-zinc-700">GitHub data · interpreted with context</p>
    </section>
    <section className="flex min-h-screen items-center px-5 py-10 sm:px-10 lg:px-14"><div className="mx-auto w-full max-w-md"><div className="mb-12 lg:hidden"><Logo/></div><p className="font-mono text-[11px] uppercase tracking-[.22em] text-lime-300">{eyebrow}</p><h1 className="mt-4 text-4xl font-semibold tracking-[-.04em] text-white">{title}</h1><p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">{description}</p>{children}<Link href="/" className="mt-8 inline-block text-xs text-zinc-600 hover:text-zinc-300">Return to DevHub</Link></div></section>
  </main>
}
function Signal({className,icon,label,value}:{className:string;icon:React.ReactNode;label:string;value:string}){return <div className={`absolute ${className} min-w-32 border border-white/10 bg-[#0b0d0f]/90 p-3 backdrop-blur`}><div className="flex items-center gap-2 text-lime-300 [&_svg]:size-3.5"><Radio className="animate-pulse"/>{icon}</div><p className="mt-4 font-mono text-[9px] uppercase tracking-[.16em] text-zinc-600">{label}</p><p className="mt-1 text-xs text-zinc-300">{value}</p></div>}
