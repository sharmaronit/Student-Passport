import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { GraduationCap, Building2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";


const roles = [
  { key: "student", to: "/student", label: "Holder", icon: GraduationCap },
  { key: "issuer", to: "/issuer", label: "Issuer", icon: Building2 },
  { key: "verifier", to: "/verify", label: "Verifier", icon: ShieldCheck },
] as const;

export function AppShell({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="hairline border-x-0 border-t-0 sticky top-0 z-40 backdrop-blur-md bg-background/85">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center border border-foreground bg-foreground text-background text-xs font-semibold tracking-wider">
              S
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-semibold">SILO</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Verifiable · Onchain
              </div>
            </div>
          </Link>

          <nav className="hairline hidden items-center gap-0 p-1 md:flex">
            {roles.map((r) => {
              const active = pathname.startsWith(r.to);
              const Icon = r.icon;
              return (
                <Link
                  key={r.key}
                  to={r.to}
                  className={
                    "flex items-center gap-2 px-3 py-1.5 text-xs uppercase tracking-[0.14em] press " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60")
                  }
                >
                  <Icon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-6" strokeWidth={1.75} />
                  {r.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">{right}<ThemeToggle /></div>
        </div>
      </header>

      <main key={pathname} className="animate-fade-in">{children}</main>


      <footer className="hairline border-x-0 border-b-0 mt-24">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row md:items-center lg:px-10">
          <div className="font-display italic">SILO — Est. 2025</div>
          <div className="mono uppercase tracking-[0.16em]">
            Deployed on Polygon · IPFS Metadata · EIP-5192 Soulbound
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          — {eyebrow}
        </div>
      )}
      <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
