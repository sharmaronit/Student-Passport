import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, BadgeCheck, ShieldCheck, Link as LinkIcon, ArrowUpRight } from "lucide-react";
import { AppShell, SectionTitle } from "@/components/passport/AppShell";
import { credentials, type Credential } from "@/lib/passport-data";

export const Route = createFileRoute("/verify")({
  head: () => ({
    meta: [
      { title: "Verify a Credential — Passport" },
      { name: "description", content: "Cryptographically verify any Skill Passport credential. No wallet required." },
    ],
  }),
  component: Verify,
});

function Verify() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Credential | null>(credentials[0]);

  const search = () => {
    const q = query.trim().toLowerCase();
    if (!q) return setResult(credentials[0]);
    const found = credentials.find(
      (c) => c.tokenId.toLowerCase().includes(q) || c.txHash.toLowerCase().includes(q),
    );
    setResult(found ?? null);
  };

  return (
    <AppShell
      right={
        <div className="hairline hidden items-center gap-2 bg-card px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:flex">
          <ShieldCheck className="h-3.5 w-3.5" /> Public · No wallet required
        </div>
      }
    >
      <section className="mx-auto max-w-[1200px] px-6 pt-10 lg:px-10">
        <SectionTitle
          eyebrow="Public verifier"
          title="Verify a Skill Passport credential."
          description="Paste a Token ID or transaction hash. Anyone can verify — no wallet connection required."
        />

        <div className="hairline mt-8 flex items-center bg-background">
          <Search className="ml-4 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="SBT-0421   or   0x9f3a4c1e7b2d…"
            className="mono flex-1 bg-transparent px-4 py-4 text-sm outline-none"
          />
          <button
            onClick={search}
            className="border-l border-border bg-primary px-6 py-4 text-xs uppercase tracking-[0.2em] text-primary-foreground"
          >
            Verify
          </button>
        </div>

        {/* Try samples */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="uppercase tracking-[0.18em]">Try:</span>
          {credentials.slice(0, 3).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setQuery(c.tokenId);
                setResult(c);
              }}
              className="mono hairline bg-secondary px-2 py-1 hover:bg-primary hover:text-primary-foreground"
            >
              {c.tokenId}
            </button>
          ))}
        </div>

        {result ? (
          <ResultView c={result} />
        ) : (
          <div className="hairline mt-12 bg-card p-12 text-center">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Not found
            </div>
            <h3 className="mt-3 font-display text-3xl font-semibold">No credential matches.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Check the Token ID or transaction hash and try again.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ResultView({ c }: { c: Credential }) {
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
      {/* Credential */}
      <div className="stamp relative bg-card p-10">
        {/* Verified stamp */}
        <div className="absolute right-6 top-6 -rotate-6">
          <div className="hairline flex h-28 w-28 flex-col items-center justify-center rounded-full border-[2.5px] border-foreground text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.16em]">
            <BadgeCheck className="mb-1 h-4 w-4" strokeWidth={2} />
            Cryptographically
            <br />
            Verified
            <div className="mt-1 mono text-[8px] tracking-[0.14em] opacity-70">
              {c.date}
            </div>
          </div>
        </div>

        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {c.category} · {c.tokenId}
        </div>
        <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight md:text-5xl">
          {c.title}
        </h2>

        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center border border-foreground bg-foreground text-xs font-semibold text-background">
            {c.issuer.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">{c.issuer}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {c.issuerVerified ? (
                <>
                  <BadgeCheck className="h-3.5 w-3.5 text-foreground" /> Verified issuer
                </>
              ) : (
                "Self-attested issuer"
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-2 border-t border-border pt-6 md:grid-cols-2">
          {Object.entries(c.meta).map(([k, v]) => (
            <div key={k} className="hairline bg-background p-4">
              <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {k}
              </div>
              <div className="mt-1 text-sm font-medium">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Onchain sidebar */}
      <aside className="hairline bg-background p-6">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          — Onchain proof
        </div>
        <h3 className="mt-2 font-display text-2xl font-semibold">Verification details</h3>

        <div className="mt-6 space-y-4 text-[12px]">
          <Field label="Network" value="Polygon Mainnet" />
          <Field label="Standard" value="EIP-5192 (Soulbound)" />
          <Field label="Token ID" value={c.tokenId} mono />
          <Field label="Block" value="64,281,439" mono />
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Transaction hash
            </div>
            <div className="mono mt-1 break-all bg-card p-3 text-[11px]">{c.txHash}</div>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              IPFS metadata CID
            </div>
            <div className="mono mt-1 break-all bg-card p-3 text-[11px]">{c.ipfs}</div>
          </div>
        </div>

        <a
          href="#"
          className="hairline mt-6 flex items-center justify-center gap-2 bg-primary px-4 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
        >
          View on Polygonscan <LinkIcon className="h-3.5 w-3.5" />
        </a>
        <a
          href="#"
          className="hairline mt-2 flex items-center justify-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.18em] hover:bg-secondary"
        >
          Open metadata <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </aside>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <span className={"text-right " + (mono ? "mono" : "font-medium")}>{value}</span>
    </div>
  );
}
