import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Plus, Trash2, ArrowUpRight, Check } from "lucide-react";
import { AppShell, SectionTitle } from "@/components/passport/AppShell";
import { issuedHistory, issuer } from "@/lib/passport-data";

export const Route = createFileRoute("/issuer")({
  head: () => ({
    meta: [
      { title: "Issuer Dashboard — SILO" },
      { name: "description", content: "Mint verifiable credentials as soulbound tokens." },
    ],
  }),
  component: IssuerDashboard,
});

const credentialTypes = ["Certification", "Hackathon Award", "Internship", "Course Completion"];

function IssuerDashboard() {
  const [step, setStep] = useState(1);
  const [wallet, setWallet] = useState("");
  const [type, setType] = useState(credentialTypes[0]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [meta, setMeta] = useState<{ key: string; value: string }[]>([
    { key: "Skills", value: "" },
  ]);
  const [issued, setIssued] = useState(false);

  return (
    <AppShell
      right={
        <div className="hairline hidden items-center gap-3 bg-card px-3 py-1.5 md:flex">
          <div className="grid h-7 w-7 place-items-center bg-foreground text-[10px] font-semibold text-background">
            PA
          </div>
          <div className="leading-tight">
            <div className="text-[11px] font-semibold">{issuer.name}</div>
            <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {issuer.wallet}
            </div>
          </div>
        </div>
      }
    >
      <section className="mx-auto max-w-[1400px] px-6 pt-10 lg:px-10">
        {/* Org profile */}
        <div className="hairline grid grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className="p-8 md:p-10">
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              — Issuer
            </div>
            <div className="mt-3 flex items-center gap-4">
              <h1 className="font-display text-5xl font-semibold leading-tight md:text-6xl">
                {issuer.name}
              </h1>
              <div className="hairline mt-3 flex items-center gap-1.5 bg-foreground px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-background">
                <BadgeCheck className="h-3 w-3" /> Verified
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">{issuer.type}</div>
          </div>
          <div className="hairline border-t md:border-t-0 md:border-l grid grid-cols-2 md:w-[280px]">
            <div className="border-r border-border p-6 text-center">
              <div className="font-display text-4xl font-semibold">{issuer.issued.toLocaleString()}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Issued
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="font-display text-4xl font-semibold">98%</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Verify rate
              </div>
            </div>
          </div>
        </div>

        {/* Issue form */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[380px_1fr]">
          <div>
            <SectionTitle
              eyebrow="Mint"
              title="Issue a new credential."
              description="Each credential is minted as a non-transferable soulbound token directly to the recipient's wallet."
            />
            <div className="mt-6 space-y-2">
              {["Recipient", "Details", "Metadata"].map((s, i) => {
                const n = i + 1;
                return (
                <div
                  key={s}
                  className={
                    "hairline flex items-center gap-4 p-4 transition-colors " +
                    (step === n ? "bg-primary text-primary-foreground" : "bg-card")
                  }
                >
                  <div
                    className={
                      "mono grid h-8 w-8 place-items-center border text-xs " +
                      (step === n ? "border-background" : "border-foreground")
                    }
                  >
                    {step > n ? <Check className="h-3.5 w-3.5" /> : `0${n}`}
                  </div>
                  <div className="text-sm font-medium">{s}</div>
                </div>
                );
              })}
            </div>
          </div>

          <div className="hairline bg-background p-8">
            {issued ? (
              <div className="py-10 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-foreground">
                  <Check className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-6 font-display text-3xl font-semibold">Credential minted</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Token <span className="mono">SBT-0522</span> sent to <span className="mono">{wallet || "0x71C4…3A9"}</span>
                </p>
                <button
                  onClick={() => {
                    setIssued(false);
                    setStep(1);
                    setWallet("");
                    setTitle("");
                    setDesc("");
                    setMeta([{ key: "Skills", value: "" }]);
                  }}
                  className="hairline mt-8 inline-flex bg-primary px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                >
                  Issue another
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {step === 1 && (
                  <>
                    <FormField label="Student wallet address">
                      <input
                        placeholder="0x…"
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        className="mono hairline w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </FormField>
                    <FormField label="Credential type">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="hairline w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
                      >
                        {credentialTypes.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </FormField>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField label="Title">
                      <input
                        placeholder="Ethereum Developer — Advanced"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="hairline w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </FormField>
                    <FormField label="Description">
                      <textarea
                        rows={4}
                        placeholder="Awarded upon completion of the 12-week advanced Solidity program."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="hairline w-full resize-none bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </FormField>
                  </>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Custom metadata
                    </div>
                    {meta.map((m, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
                        <input
                          placeholder="Key"
                          value={m.key}
                          onChange={(e) => {
                            const next = [...meta];
                            next[i].key = e.target.value;
                            setMeta(next);
                          }}
                          className="hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          placeholder="Value"
                          value={m.value}
                          onChange={(e) => {
                            const next = [...meta];
                            next[i].value = e.target.value;
                            setMeta(next);
                          }}
                          className="hairline bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <button
                          onClick={() => setMeta(meta.filter((_, j) => j !== i))}
                          className="hairline grid place-items-center px-3 hover:bg-secondary"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setMeta([...meta, { key: "", value: "" }])}
                      className="hairline flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.16em] hover:bg-secondary"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add field
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-6">
                  <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="text-xs uppercase tracking-[0.18em] text-muted-foreground disabled:opacity-30 hover:text-foreground"
                  >
                    ← Back
                  </button>
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      className="hairline bg-primary px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => setIssued(true)}
                      className="hairline bg-primary px-5 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground"
                    >
                      Mint Credential
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-24">
          <SectionTitle eyebrow="Ledger" title="Issuance history" />
          <div className="hairline mt-8 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-card">
                <tr className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Recipient</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {issuedHistory.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-card/60">
                    <td className="px-6 py-4 font-medium">{r.title}</td>
                    <td className="mono px-6 py-4 text-muted-foreground">{r.recipient}</td>
                    <td className="px-6 py-4 text-muted-foreground">{r.type}</td>
                    <td className="mono px-6 py-4 text-muted-foreground">{r.date}</td>
                    <td className="px-6 py-4">
                      <a
                        href="#"
                        className="mono inline-flex items-center gap-1 text-foreground hover:underline"
                      >
                        {r.tx} <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
