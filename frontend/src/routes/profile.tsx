import { createFileRoute, Link } from "@tanstack/react-router";
import QRCode from "react-qr-code";
import { ArrowLeft, Github, Linkedin, Link as LinkIcon } from "lucide-react";
import { AppShell, SectionTitle } from "@/components/passport/AppShell";
import { student, shortWallet } from "@/lib/passport-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SILO" },
      { name: "description", content: "Your SILO identity and public link." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AppShell
      right={
        <Link
          to="/student"
          className="hairline hidden items-center gap-2 bg-card px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] hover:bg-secondary md:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to SILO
        </Link>
      }
    >
      <section className="mx-auto max-w-[1400px] px-6 pt-10 lg:px-10">
        <SectionTitle
          eyebrow="Profile"
          title="Identity at a glance."
          description="Scan the code to open this SILO on any device — no wallet required."
        />
        <div className="hairline mt-8 grid grid-cols-1 lg:grid-cols-[auto_1fr]">
          {/* QR panel */}
          <div className="flex flex-col items-center gap-4 border-b border-border p-8 lg:border-b-0 lg:border-r lg:w-[300px]">
            <div className="hairline bg-background p-4">
              <QRCode
                value={`https://silo.id/p/${student.github}`}
                size={180}
                bgColor="transparent"
                fgColor="currentColor"
                className="text-foreground"
              />
            </div>
            <div className="text-center">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Public link
              </div>
              <div className="mono mt-1 text-[11px]">silo.id/p/{student.github}</div>
            </div>
          </div>

          {/* Details panel */}
          <div className="p-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center bg-foreground text-sm font-semibold text-background">
                {student.avatar}
              </div>
              <div>
                <div className="font-display text-xl font-semibold">{student.name}</div>
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Verified holder
                </div>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { l: "University", v: student.university },
                { l: "Graduation", v: `Class of ${student.gradYear}` },
                { l: "Wallet", v: shortWallet(student.wallet), mono: true },
                {
                  l: "GitHub",
                  v: (
                    <a href="#" className="flex items-center gap-1.5 hover:underline">
                      <Github className="h-3.5 w-3.5" /> {student.github}
                    </a>
                  ),
                },
                {
                  l: "LinkedIn",
                  v: (
                    <a href="#" className="flex items-center gap-1.5 hover:underline">
                      <Linkedin className="h-3.5 w-3.5" /> {student.linkedin}
                    </a>
                  ),
                },
                {
                  l: "Website",
                  v: (
                    <a href="#" className="flex items-center gap-1.5 hover:underline">
                      <LinkIcon className="h-3.5 w-3.5" /> silo.id/p/{student.github}
                    </a>
                  ),
                },
              ].map((f) => (
                <div key={f.l} className="border-b border-border pb-3">
                  <dt className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {f.l}
                  </dt>
                  <dd
                    className={
                      "mt-1 text-sm text-foreground " + (f.mono ? "mono text-[12px]" : "")
                    }
                  >
                    {f.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
