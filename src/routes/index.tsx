import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDeviceId } from "@/lib/device";
import { QUESTIONS, TOTAL_QUESTIONS, namesForQuestion } from "@/lib/questions";
import { getSession, joinQuiz, submitVote } from "@/lib/quiz.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Friend Group Quiz — 40 Questions, 8 Friends" },
      {
        name: "description",
        content:
          "Vote on 40 questions about Ruben, Rhia, Niya, Zach, Nathan, Josh, Esther and Isha, then see the results as pie charts.",
      },
      { property: "og:title", content: "Friend Group Quiz — 40 Questions, 8 Friends" },
      {
        property: "og:description",
        content: "Vote on 40 questions about the group and see the results as pie charts.",
      },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  const join = useServerFn(joinQuiz);
  const session = useServerFn(getSession);
  const vote = useServerFn(submitVote);

  const [deviceId, setDeviceId] = useState("");
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);
    session({ data: { deviceId: id } })
      .then((res) => {
        setDisplayName(res.displayName);
        setAnswers(res.answers);
        const answered = Object.keys(res.answers).length;
        setIndex(Math.min(answered, TOTAL_QUESTIONS - 1));
      })
      .catch(() => setError("Couldn't load your session. Try refreshing."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = Object.keys(answers).length;
  const finished = answeredCount >= TOTAL_QUESTIONS;

  if (loading) {
    return <Shell><p className="text-sm text-muted-foreground">Loading…</p></Shell>;
  }

  if (!displayName) {
    return (
      <Shell>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Friend Group Quiz</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            40 questions about the eight of you. Your individual answers stay private — only the
            combined results are shown.
          </p>
          <form
            className="mt-6 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!nameInput.trim()) return;
              setBusy(true);
              setError(null);
              try {
                const res = await join({
                  data: { deviceId, displayName: nameInput.trim() },
                });
                setDisplayName(res.displayName);
              } catch {
                setError("Couldn't save your name. Try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name"
              maxLength={30}
              aria-label="Your display name"
            />
            <Button type="submit" className="w-full rounded-full" disabled={busy}>
              {busy ? "Starting…" : "Start quiz"}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </div>
      </Shell>
    );
  }

  if (finished) {
    return (
      <Shell>
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">All 40 answered</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks, {displayName}. Your answers are saved.
          </p>
          <Link to="/results" className="mt-6 inline-block">
            <Button className="rounded-full">View results</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  const questionId = index;
  const question = QUESTIONS[questionId]!;
  const names = namesForQuestion(questionId);
  const existing = answers[questionId] ?? null;
  const current = existing ?? selected;

  return (
    <Shell>
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {questionId + 1} of {TOTAL_QUESTIONS}
          </span>
          <span>{displayName}</span>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
          />
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-tight sm:text-2xl">{question}</h1>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {names.map((name) => {
            const active = current === name;
            return (
              <button
                key={name}
                type="button"
                disabled={!!existing}
                onClick={() => setSelected(name)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                } disabled:cursor-not-allowed disabled:opacity-70`}
              >
                {name}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-7 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {existing ? "Answer locked in." : "Pick one to continue."}
          </span>
          <Button
            className="rounded-full"
            disabled={!current || busy}
            onClick={async () => {
              if (!current) return;
              setBusy(true);
              setError(null);
              try {
                if (!existing) {
                  await vote({ data: { deviceId, questionId, choice: current } });
                }
                setAnswers((prev) => ({ ...prev, [questionId]: current }));
                setSelected(null);
                setIndex((i) => Math.min(i + 1, TOTAL_QUESTIONS - 1));
              } catch {
                setError("Couldn't save your answer. Try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {questionId + 1 === TOTAL_QUESTIONS ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-3xl px-5 py-10 sm:py-14">{children}</main>;
}
