import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUESTIONS } from "@/lib/questions";
import { getAdminData } from "@/lib/quiz.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Friend Group Quiz" },
      { name: "description", content: "Private admin view of quiz responses." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Friend Group Quiz" },
      { property: "og:description", content: "Private admin view of quiz responses." },
    ],
  }),
  component: AdminPage,
});

type AdminData = Awaited<ReturnType<typeof getAdminData>>;

function AdminPage() {
  const fetchAdmin = useServerFn(getAdminData);
  const [passcode, setPasscode] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>

      {!data ? (
        <form
          className="mt-6 flex max-w-sm gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            try {
              setData(await fetchAdmin({ data: { passcode } }));
            } catch {
              setError("Incorrect passcode.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Admin passcode"
            aria-label="Admin passcode"
          />
          <Button type="submit" className="rounded-full" disabled={busy}>
            Open
          </Button>
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          {data.players.length === 0 && (
            <p className="text-sm text-muted-foreground">No players yet.</p>
          )}
          {data.players.map((p) => (
            <section key={p.name} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold">{p.name}</h2>
                <span className="text-sm text-muted-foreground">
                  {p.answers.length} / {QUESTIONS.length} answered
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.answers.map((a) => (
                  <li
                    key={a.questionId}
                    className="flex justify-between gap-4 border-b border-border/60 py-1.5"
                  >
                    <span className="text-muted-foreground">
                      {a.questionId + 1}. {QUESTIONS[a.questionId]}
                    </span>
                    <span className="font-medium">{a.choice}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </main>
  );
}
