import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { VoteLegend, VotePie } from "@/components/VotePie";
import { FRIENDS, QUESTIONS, TOTAL_QUESTIONS } from "@/lib/questions";
import { getResults, type QuestionTally } from "@/lib/quiz.functions";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — Friend Group Quiz" },
      {
        name: "description",
        content:
          "Live pie-chart results for all 40 friend group quiz questions, plus the overall vote totals.",
      },
      { property: "og:title", content: "Results — Friend Group Quiz" },
      {
        property: "og:description",
        content: "Live pie-chart results for all 40 questions plus overall vote totals.",
      },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const fetchResults = useServerFn(getResults);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["results"],
    queryFn: () => fetchResults(),
    refetchInterval: 15000,
  });
  const [tab, setTab] = useState<"overall" | "questions">("overall");

  const summary = useMemo(() => (data ? buildSummary(data.tallies) : null), [data]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data
              ? `${data.playerCount} player${data.playerCount === 1 ? "" : "s"} · ${summary?.totalVotes ?? 0} votes`
              : "Loading…"}
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-border bg-card p-1 text-sm">
          {(["overall", "questions"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "overall" ? "Overall" : "By question"}
            </button>
          ))}
        </div>
      </div>

      {isError && <p className="mt-8 text-sm text-destructive">Couldn't load results.</p>}
      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading results…</p>}

      {data && summary && tab === "overall" && (
        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Total votes across all 40 questions</h2>
            <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <VotePie counts={summary.totals} total={summary.totalVotes} size={220} />
              <VoteLegend counts={summary.totals} total={summary.totalVotes} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Questions won</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Number of questions each person received the most votes on (ties count for everyone
              tied).
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {FRIENDS.map((n) => ({ n, w: summary.wins[n] ?? 0 }))
                .sort((a, b) => b.w - a.w)
                .map(({ n, w }) => (
                  <li key={n} className="flex justify-between border-b border-border/60 py-1.5">
                    <span>{n}</span>
                    <span className="tabular-nums text-muted-foreground">{w}</span>
                  </li>
                ))}
            </ul>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <Stat
              label="Most popular answer overall"
              value={summary.mostPopular ? summary.mostPopular.name : "—"}
              detail={
                summary.mostPopular
                  ? `${summary.mostPopular.votes} votes (${summary.mostPopular.pct}%)`
                  : "No votes yet"
              }
            />
            <Stat
              label="Most unanimous question"
              value={summary.mostUnanimous ? QUESTIONS[summary.mostUnanimous.questionId]! : "—"}
              detail={
                summary.mostUnanimous
                  ? `${summary.mostUnanimous.name} — ${summary.mostUnanimous.pct}%`
                  : "No votes yet"
              }
            />
            <Stat
              label="Closest / most split question"
              value={summary.mostSplit ? QUESTIONS[summary.mostSplit.questionId]! : "—"}
              detail={
                summary.mostSplit
                  ? `Top answer only ${summary.mostSplit.pct}%`
                  : "No votes yet"
              }
            />
          </section>
        </div>
      )}

      {data && tab === "questions" && (
        <div className="mt-8 space-y-4">
          {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
            const tally = data.tallies[i]!;
            return (
              <section key={i} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs text-muted-foreground">Question {i + 1}</p>
                <h2 className="mt-1 text-base font-semibold">{QUESTIONS[i]}</h2>
                <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
                  <VotePie counts={tally.counts} total={tally.total} size={180} />
                  <VoteLegend counts={tally.counts} total={tally.total} />
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-snug">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function buildSummary(tallies: QuestionTally[]) {
  const totals: Record<string, number> = Object.fromEntries(FRIENDS.map((n) => [n, 0]));
  const wins: Record<string, number> = Object.fromEntries(FRIENDS.map((n) => [n, 0]));
  let totalVotes = 0;

  let mostUnanimous: { questionId: number; name: string; pct: number } | null = null;
  let mostSplit: { questionId: number; pct: number } | null = null;

  for (const t of tallies) {
    totalVotes += t.total;
    for (const n of FRIENDS) totals[n] = (totals[n] ?? 0) + (t.counts[n] ?? 0);
    if (t.total === 0) continue;

    const max = Math.max(...FRIENDS.map((n) => t.counts[n] ?? 0));
    for (const n of FRIENDS) if ((t.counts[n] ?? 0) === max) wins[n] = (wins[n] ?? 0) + 1;

    const pct = Math.round((max / t.total) * 100);
    const topName = FRIENDS.find((n) => (t.counts[n] ?? 0) === max)!;
    if (!mostUnanimous || pct > mostUnanimous.pct) {
      mostUnanimous = { questionId: t.questionId, name: topName, pct };
    }
    if (!mostSplit || pct < mostSplit.pct) {
      mostSplit = { questionId: t.questionId, pct };
    }
  }

  const topOverall = FRIENDS.reduce(
    (best, n) => ((totals[n] ?? 0) > best.votes ? { name: n as string, votes: totals[n] ?? 0 } : best),
    { name: "", votes: 0 },
  );

  return {
    totals,
    wins,
    totalVotes,
    mostUnanimous,
    mostSplit,
    mostPopular:
      topOverall.votes > 0
        ? { ...topOverall, pct: Math.round((topOverall.votes / totalVotes) * 100) }
        : null,
  };
}

