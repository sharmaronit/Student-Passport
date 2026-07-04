import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Copy,
  Check,
  Github,
  Link as LinkIcon,

  X,
  Star,
  BadgeCheck,
  ExternalLink,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import { AppShell, SectionTitle } from "@/components/passport/AppShell";
import {
  credentials,
  student,
  shortWallet,
  contributionHeatmap,
  githubStats,
  type Credential,
} from "@/lib/passport-data";

export const Route = createFileRoute("/student")({
  head: () => ({
    meta: [
      { title: "Holder Dashboard — SILO" },
      { name: "description", content: "Your soulbound credentials, at a glance." },
    ],
  }),
  component: StudentDashboard,
});

const categories = ["All", "Hackathons", "Certifications", "Internships", "Projects"] as const;
type Cat = (typeof categories)[number];

function StudentDashboard() {
  const [cat, setCat] = useState<Cat>("All");
  const [shareOpen, setShareOpen] = useState(false);
  const [detail, setDetail] = useState<Credential | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(
    () => (cat === "All" ? credentials : credentials.filter((c) => c.category === cat)),
    [cat],
  );

  return (
    <AppShell
      right={
        <Link
          to="/profile"
          className="hairline hidden items-center gap-3 bg-card px-3 py-1.5 transition-colors hover:bg-secondary md:flex"
          aria-label="Open profile"
        >
          <div className="grid h-7 w-7 place-items-center bg-foreground text-[10px] font-semibold text-background">
            {student.avatar}
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold">{student.name}</div>
            <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {shortWallet(student.wallet)}
            </div>
          </div>
          <span className="ml-1 h-2 w-2 rounded-full bg-emerald-600" />
        </Link>
      }
    >

      <section className="mx-auto max-w-[1400px] px-6 pt-10 lg:px-10">
        {/* Profile masthead */}
        <div className="hairline grid grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className="p-8 md:p-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              — Holder
            </div>
            <h1 className="mt-3 font-display text-5xl font-semibold leading-tight md:text-6xl">
              {student.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>{student.university}</span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span>Class of {student.gradYear}</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShareOpen(true)}
                className="hairline group flex items-center gap-2 bg-primary px-4 py-2.5 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                <Share2 className="h-3.5 w-3.5" /> Share SILO
              </button>
              <button className="hairline flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-secondary">
                <Copy className="h-3.5 w-3.5" /> {shortWallet(student.wallet)}
              </button>
            </div>
          </div>

          <div className="hairline border-t md:border-t-0 md:border-l grid grid-cols-3 md:w-[360px]">
            {[
              { k: credentials.length, l: "Credentials" },
              { k: credentials.filter((c) => c.issuerVerified).length, l: "Verified" },
              { k: 12, l: "Endorsements" },
            ].map((s) => (
              <div key={s.l} className="border-r border-border last:border-r-0 p-6 text-center">
                <div className="font-display text-4xl font-semibold">{s.k}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>




        {/* Credentials */}
        <div className="mt-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle
              eyebrow="Soulbound Credentials"
              title="The record, cryptographically signed."
              description="Non-transferable tokens minted directly to the holder's wallet, following the EIP-5192 soulbound standard."
            />
            <div className="hairline flex flex-wrap p-1">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={
                    "px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-colors " +
                    (cat === c
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CredentialCard key={c.id} c={c} onClick={() => setDetail(c)} />
            ))}
          </div>
        </div>

        {/* GitHub */}
        <div className="mt-24">
          <SectionTitle
            eyebrow="Attached signal"
            title="GitHub contribution graph"
            description="Live builder activity, imported alongside your credentials."
          />
          <div className="hairline mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px]">
            <div className="p-8">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Last 52 weeks · 1,247 contributions</span>
                <a href="#" className="flex items-center gap-1 text-foreground hover:underline">
                  {student.github} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-6 flex gap-[3px] overflow-x-auto">
                {contributionHeatmap.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((v, di) => (
                      <div
                        key={di}
                        className="h-[11px] w-[11px]"
                        style={{ backgroundColor: heatColor(v) }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Less
                {[0, 1, 2, 3, 4].map((v) => (
                  <div key={v} className="h-[10px] w-[10px]" style={{ backgroundColor: heatColor(v) }} />
                ))}
                More
              </div>
            </div>
            <div className="hairline border-l-0 lg:border-l border-t lg:border-t-0 p-8">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: githubStats.stars.toLocaleString(), l: "Stars", icon: Star },
                  { k: githubStats.repos, l: "Repos", icon: Github },
                  { k: githubStats.followers, l: "Followers", icon: BadgeCheck },
                ].map((s) => (
                  <div key={s.l} className="hairline p-3 text-center">
                    <div className="font-display text-xl font-semibold">{s.k}</div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Top languages
                </div>
                <div className="mt-3 space-y-2">
                  {githubStats.topLanguages.map((l) => (
                    <div key={l.name}>
                      <div className="flex justify-between text-[11px]">
                        <span>{l.name}</span>
                        <span className="mono text-muted-foreground">{l.pct}%</span>
                      </div>
                      <div className="mt-1 h-[3px] w-full bg-border/60">
                        <div className="h-full bg-foreground" style={{ width: `${l.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom cross-link */}
        <div className="hairline mt-16 flex flex-col items-start justify-between gap-4 bg-card p-8 md:flex-row md:items-center">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              For recruiters
            </div>
            <div className="mt-1 font-display text-2xl font-semibold">
              Anyone can verify. No wallet required.
            </div>
          </div>
          <Link
            to="/verify"
            className="hairline group flex items-center gap-2 bg-primary px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            Open Verifier
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {shareOpen && (
        <ShareModal
          onClose={() => setShareOpen(false)}
          copied={copied}
          onCopy={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        />
      )}
      {detail && <CredentialModal c={detail} onClose={() => setDetail(null)} />}
    </AppShell>
  );
}

function heatColor(v: number) {
  // Beige to warm dark tones (no bright green)
  const scale = [
    "oklch(0.93 0.02 82)",
    "oklch(0.85 0.05 90)",
    "oklch(0.7 0.08 100)",
    "oklch(0.5 0.09 105)",
    "oklch(0.32 0.07 110)",
  ];
  return scale[v] ?? scale[0];
}

function CredentialCard({ c, onClick }: { c: Credential; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="stamp group relative block w-full bg-card p-6 text-left"
    >
      {/* Corner mark */}
      <div className="absolute right-4 top-4 rotate-6">
        <div className="hairline flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground text-center text-[8px] font-semibold uppercase leading-tight tracking-[0.14em]">
          {c.issuerVerified ? (
            <span>
              Chain
              <br />
              Verified
            </span>
          ) : (
            <span>
              Self
              <br />
              Attested
            </span>
          )}
        </div>
      </div>

      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {c.category} · {c.tokenId}
      </div>
      <h3 className="mt-4 pr-16 font-display text-xl font-semibold leading-snug">{c.title}</h3>
      <div className="mt-1 text-xs text-muted-foreground">Issued by {c.issuer}</div>

      <div className="mt-6 space-y-1.5 border-t border-border pt-4">
        {Object.entries(c.meta)
          .slice(0, 3)
          .map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 text-[11px]">
              <span className="uppercase tracking-[0.14em] text-muted-foreground">{k}</span>
              <span className="text-right font-medium text-foreground">{v}</span>
            </div>
          ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[10px] uppercase tracking-[0.18em]">
        <span className="mono text-muted-foreground">{c.date}</span>
        <span className="flex items-center gap-1 text-foreground">
          View <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
    </button>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="hairline relative w-full max-w-lg bg-background p-8 shadow-[6px_6px_0_0_var(--color-foreground)] animate-scale-in">

        <button
          onClick={onClose}
          className="hairline absolute right-4 top-4 grid h-8 w-8 place-items-center hover:bg-secondary"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function ShareModal({
  onClose,
  copied,
  onCopy,
}: {
  onClose: () => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const [expiry, setExpiry] = useState("7d");
  const [limitViews, setLimitViews] = useState(false);
  const [viewCount, setViewCount] = useState(25);
  const url = `silo.id/p/ava-chen?exp=${expiry}${limitViews ? `&v=${viewCount}` : ""}`;

  return (
    <Modal onClose={onClose}>
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        — Share
      </div>
      <h3 className="mt-2 font-display text-3xl font-semibold">Public verification link</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Grant read-only access to your SILO. Recipients can verify without connecting a wallet.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Expiry
          </label>
          <div className="mt-2 hairline grid grid-cols-4">
            {["24h", "7d", "30d", "∞"].map((e) => (
              <button
                key={e}
                onClick={() => setExpiry(e)}
                className={
                  "border-r border-border last:border-r-0 py-2 text-xs uppercase tracking-[0.14em] transition-colors " +
                  (expiry === e ? "bg-primary text-primary-foreground" : "hover:bg-secondary")
                }
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <label className="hairline flex cursor-pointer items-center justify-between p-4">
          <div>
            <div className="text-sm font-medium">Limit views</div>
            <div className="text-[11px] text-muted-foreground">Auto-expire after a set number.</div>
          </div>
          <button
            onClick={() => setLimitViews((v) => !v)}
            className={
              "hairline relative h-6 w-11 transition-colors " +
              (limitViews ? "bg-primary" : "bg-transparent")
            }
          >
            <span
              className={
                "absolute top-[2px] h-4 w-4 bg-background transition-transform " +
                (limitViews ? "translate-x-[22px]" : "translate-x-[2px]")
              }
            />
          </button>
        </label>

        {limitViews && (
          <input
            type="number"
            value={viewCount}
            onChange={(e) => setViewCount(Number(e.target.value))}
            className="hairline w-full bg-transparent px-4 py-2 text-sm outline-none focus:border-primary"
          />
        )}

        <div className="hairline flex items-center bg-card">
          <div className="mono flex-1 overflow-x-auto px-4 py-3 text-[12px]">{url}</div>
          <button
            onClick={onCopy}
            className="flex items-center gap-2 border-l border-border bg-primary px-4 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CredentialModal({ c, onClose }: { c: Credential; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {c.category} · {c.tokenId} · {c.date}
      </div>
      <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">{c.title}</h3>
      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
        {c.issuer}
        {c.issuerVerified && <BadgeCheck className="h-4 w-4 text-foreground" />}
      </div>

      <div className="mt-6 space-y-2 border-t border-border pt-4">
        {Object.entries(c.meta).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-[12px]">
            <span className="uppercase tracking-[0.14em] text-muted-foreground">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2 border-t border-border pt-4">
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">Tx Hash</span>
          <span className="mono truncate max-w-[240px]">{c.txHash}</span>
        </div>
        <div className="flex justify-between gap-4 text-[11px]">
          <span className="uppercase tracking-[0.14em] text-muted-foreground">IPFS</span>
          <span className="mono truncate max-w-[240px]">{c.ipfs}</span>
        </div>
      </div>

      <a
        href="#"
        className="hairline mt-6 flex items-center justify-center gap-2 bg-foreground px-4 py-3 text-xs uppercase tracking-[0.18em] text-background"
      >
        View on Polygonscan <LinkIcon className="h-3.5 w-3.5" />
      </a>
    </Modal>
  );
}
