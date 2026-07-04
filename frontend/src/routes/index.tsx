import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, GraduationCap, Building2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/passport/ThemeToggle";


export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      setPointer({
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden bg-background text-foreground animate-fade-in">
      {/* Ambient animated blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-32 h-[520px] w-[520px] animate-blob bg-primary/25 blur-3xl"
          style={{ transform: `translate(${pointer.x * 20}px, ${pointer.y * 20}px)` }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[560px] w-[560px] animate-blob bg-accent/25 blur-3xl"
          style={{ animationDelay: "-6s", transform: `translate(${pointer.x * -30}px, ${pointer.y * -18}px)` }}
        />
        <div
          className="absolute bottom-[-160px] left-1/3 h-[440px] w-[440px] animate-blob bg-secondary/60 blur-3xl"
          style={{ animationDelay: "-12s", transform: `translate(${pointer.x * 12}px, ${pointer.y * -24}px)` }}
        />
      </div>

      <header className="relative z-10 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 lg:px-10 animate-fade-down">
        <div className="flex items-center gap-3 group">
          <div className="grid h-9 w-9 place-items-center border border-foreground bg-foreground text-background text-xs font-semibold tracking-wider transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
            P
          </div>
          <div className="font-display text-[15px] font-semibold">PASSPORT</div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/auth"
            className="hairline group magnetic flex items-center gap-2 bg-primary px-4 py-2 text-xs uppercase tracking-[0.18em] text-primary-foreground"
          >
            Enter
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2} />
          </Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pt-16 pb-24 lg:px-10 lg:pt-24 page-enter">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 animate-float rounded-full bg-primary" />
          Volume 01 · Issue No. 2026
        </div>

        <h1 className="mt-6 font-display text-6xl font-semibold leading-[0.95] tracking-tight md:text-8xl lg:text-[10rem]">
          <span className="reveal-mask">
            <span className="animate-reveal" style={{ animationDelay: "120ms" }}>Verifiable</span>
          </span>
          <br />
          <span className="reveal-mask">
            <span className="italic font-normal animate-reveal" style={{ animationDelay: "320ms" }}>
              proof of skill.
            </span>
          </span>
          {/* Hand-drawn underline */}
          <svg
            className="mt-4 block h-6 w-64 text-primary"
            viewBox="0 0 400 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path
              className="animate-draw"
              d="M4 24 C 80 4, 200 40, 396 14"
            />
          </svg>
        </h1>

        <div className="mt-10 grid gap-8 border-t border-border pt-8 md:grid-cols-3">
          <p className="font-display text-lg leading-snug md:col-span-2">
            A tamper-proof identity for the next generation of talent — hackathon wins,
            certifications, internships, and shipped work, held by the student and
            cryptographically signed by the institutions that granted them.
          </p>
          <div className="flex md:justify-end">
            <Link
              to="/auth"
              className="hairline group magnetic flex items-center gap-3 bg-primary px-5 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground"
            >
              Open Passport
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Marquee ribbon */}
        <div className="mt-16 hairline border-x-0 overflow-hidden py-4">
          <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-2xl italic text-muted-foreground">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex items-center gap-12">
                {["Hackathons", "Internships", "Certifications", "Open Source", "Shipped Work", "Research", "Awards"].map(
                  (w) => (
                    <span key={w} className="flex items-center gap-12">
                      <span>{w}</span>
                      <span className="text-primary">✦</span>
                    </span>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="hairline mt-16 grid md:grid-cols-3">
          {[
            { icon: GraduationCap, tag: "Holder", title: "Own your record", to: "/student" },
            { icon: Building2, tag: "Issuer", title: "Mint the credential", to: "/issuer" },
            { icon: ShieldCheck, tag: "Verifier", title: "Trust, in one link", to: "/verify" },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.tag}
                to={r.to}
                className={
                  "group relative flex flex-col justify-between overflow-hidden p-8 press transition-colors duration-500 hover:bg-card " +
                  (i < 2 ? "md:border-r border-border" : "")
                }
              >
                {/* animated sweep on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/15 to-transparent transition-transform duration-[900ms] ease-out group-hover:translate-x-full"
                />
                <Icon
                  className="h-6 w-6 transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:rotate-[-6deg]"
                  strokeWidth={1.5}
                />
                <div className="mt-16 relative">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {r.tag}
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold transition-transform duration-500 group-hover:-translate-y-0.5">
                    {r.title}
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                    <span className="hover-underline">Enter</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
