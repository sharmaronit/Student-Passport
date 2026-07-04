import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/passport/ThemeToggle";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SILO" },
      { name: "description", content: "Connect your wallet or sign in with email to open your SILO." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* LEFT — editorial */}
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-border bg-foreground p-10 text-background lg:p-14">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] opacity-80">
          <Link to="/" className="flex items-center gap-2 hover:opacity-100">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <span>Vol. 01 · 2026</span>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] opacity-70">
            — SILO
          </div>
          <h1 className="mt-6 font-display text-6xl font-semibold leading-[0.95] md:text-7xl">
            Verifiable
            <br />
            <span className="italic font-normal">proof of skill.</span>
          </h1>
          <p className="mt-8 max-w-md font-display text-lg leading-snug opacity-90">
            One SILO. Every credential you earn — from hackathon wins to your first
            internship — signed on-chain by the institutions that granted them, held by you.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 border-t border-background/20 pt-6 text-xs uppercase tracking-[0.16em] opacity-80">
          <div>
            <div className="font-display text-2xl font-semibold normal-case tracking-normal">
              1,284
            </div>
            Credentials issued
          </div>
          <div>
            <div className="font-display text-2xl font-semibold normal-case tracking-normal">
              214
            </div>
            Institutions
          </div>
          <div>
            <div className="font-display text-2xl font-semibold normal-case tracking-normal">
              47k
            </div>
            Verifications
          </div>
        </div>
      </div>

      {/* RIGHT — auth */}
      <div className="relative flex flex-col justify-center bg-background p-10 lg:p-16">
        <div className="absolute right-6 top-6"><ThemeToggle /></div>
        <div className="mx-auto w-full max-w-md">

          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            — Sign in
          </div>
          <h2 className="mt-4 font-display text-4xl font-semibold">Open your SILO</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Connect a wallet to hold your credentials as soulbound tokens, or continue with
            email to preview the experience.
          </p>

          {/* Wallets */}
          <div className="mt-10 space-y-3">
            <button
              onClick={() => {
                setConnected(true);
                setTimeout(() => navigate({ to: "/student" }), 500);
              }}
              className={
                "hairline group flex w-full items-center justify-between px-5 py-4 text-left transition-all " +
                (connected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--color-foreground)]")
              }
            >
              <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center border border-current">
                  <Wallet className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {connected ? "Wallet connected" : "Connect Wallet"}
                  </div>
                  <div className="mono text-[11px] uppercase tracking-[0.14em] opacity-70">
                    {connected ? "0x71C4…3A9" : "MetaMask · WalletConnect"}
                  </div>
                </div>
              </div>
              {connected ? (
                <Check className="h-4 w-4" strokeWidth={2} />
              ) : (
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              {["MetaMask", "WalletConnect"].map((w) => (
                <button
                  key={w}
                  onClick={() => {
                    setConnected(true);
                    setTimeout(() => navigate({ to: "/student" }), 500);
                  }}
                  className="hairline flex items-center justify-center px-4 py-3 text-[11px] uppercase tracking-[0.18em] transition-colors hover:bg-secondary"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or continue with email
            <div className="h-px flex-1 bg-border" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/student" });
            }}
            className="space-y-3"
          >
            <label className="block">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ava@mit.edu"
                className="mt-1 hairline w-full bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="hairline w-full bg-primary px-5 py-3 text-xs uppercase tracking-[0.2em] text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Sign in with Email
            </button>
          </form>

          <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span>Verifier?</span>
            <Link to="/verify" className="flex items-center gap-1 text-foreground hover:underline">
              Verify a credential <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
