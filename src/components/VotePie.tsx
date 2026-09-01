import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { FRIENDS, FRIEND_COLORS, type Friend } from "@/lib/questions";

type Props = {
  counts: Record<string, number>;
  total: number;
  size?: number;
};

export function VotePie({ counts, total, size = 240 }: Props) {
  const data = FRIENDS.filter((n) => (counts[n] ?? 0) > 0).map((n) => ({
    name: n,
    value: counts[n] ?? 0,
  }));

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-dashed border-border text-sm text-muted-foreground"
        style={{ width: size, height: size }}
      >
        No votes yet
      </div>
    );
  }

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="52%"
            outerRadius="88%"
            paddingAngle={1}
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={FRIEND_COLORS[entry.name as Friend]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} vote${value === 1 ? "" : "s"} · ${Math.round((value / total) * 100)}%`,
              name,
            ]}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              fontSize: "0.8rem",
              color: "var(--foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VoteLegend({ counts, total }: { counts: Record<string, number>; total: number }) {
  const rows = FRIENDS.map((n) => ({ name: n, votes: counts[n] ?? 0 })).sort(
    (a, b) => b.votes - a.votes,
  );

  return (
    <ul className="w-full space-y-1.5">
      {rows.map((r) => (
        <li key={r.name} className="flex items-center gap-3 text-sm">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: FRIEND_COLORS[r.name] }}
          />
          <span className="flex-1 text-foreground">{r.name}</span>
          <span className="tabular-nums text-muted-foreground">
            {total ? Math.round((r.votes / total) * 100) : 0}%
          </span>
          <span className="w-16 text-right tabular-nums text-muted-foreground">
            {r.votes} vote{r.votes === 1 ? "" : "s"}
          </span>
        </li>
      ))}
    </ul>
  );
}
