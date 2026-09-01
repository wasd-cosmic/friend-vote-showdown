import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { FRIENDS, TOTAL_QUESTIONS } from "./questions";

const deviceSchema = z.object({
  deviceId: z.string().min(8).max(64),
});

const nameSet = new Set<string>(FRIENDS);

export type QuestionTally = {
  questionId: number;
  counts: Record<string, number>;
  total: number;
};

export const joinQuiz = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    deviceSchema.extend({ displayName: z.string().trim().min(1).max(30) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player, error } = await supabaseAdmin
      .from("players")
      .upsert(
        { device_id: data.deviceId, display_name: data.displayName },
        { onConflict: "device_id" },
      )
      .select("id, display_name")
      .single();
    if (error) throw new Error(error.message);
    return { displayName: player.display_name };
  });

export const getSession = createServerFn({ method: "POST" })
  .inputValidator((data) => deviceSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, display_name")
      .eq("device_id", data.deviceId)
      .maybeSingle();

    if (!player) return { displayName: null as string | null, answers: {} as Record<number, string> };

    const { data: votes } = await supabaseAdmin
      .from("votes")
      .select("question_id, choice")
      .eq("player_id", player.id);

    const answers: Record<number, string> = {};
    for (const v of votes ?? []) answers[v.question_id] = v.choice;
    return { displayName: player.display_name, answers };
  });

export const submitVote = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    deviceSchema
      .extend({
        questionId: z.number().int().min(0).max(TOTAL_QUESTIONS - 1),
        choice: z.string().refine((v) => nameSet.has(v), "Unknown name"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id")
      .eq("device_id", data.deviceId)
      .maybeSingle();
    if (!player) throw new Error("Join the quiz first.");

    const { error } = await supabaseAdmin.from("votes").insert({
      player_id: player.id,
      question_id: data.questionId,
      choice: data.choice,
    });
    // Duplicate submissions are ignored, never overwritten.
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

export const getResults = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: votes, error } = await supabaseAdmin
    .from("votes")
    .select("question_id, choice")
    .limit(100000);
  if (error) throw new Error(error.message);

  const tallies: QuestionTally[] = Array.from({ length: TOTAL_QUESTIONS }, (_, questionId) => ({
    questionId,
    counts: Object.fromEntries(FRIENDS.map((n) => [n, 0])),
    total: 0,
  }));

  for (const v of votes ?? []) {
    const t = tallies[v.question_id];
    if (!t || !(v.choice in t.counts)) continue;
    t.counts[v.choice] = (t.counts[v.choice] ?? 0) + 1;
    t.total += 1;
  }

  const { count: playerCount } = await supabaseAdmin
    .from("players")
    .select("id", { count: "exact", head: true });

  return { tallies, playerCount: playerCount ?? 0 };
});

export const getAdminData = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ passcode: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env["ADMIN_PASSCODE"];
    if (!expected || data.passcode !== expected) {
      throw new Error("Incorrect passcode.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: players } = await supabaseAdmin
      .from("players")
      .select("id, display_name, created_at")
      .order("created_at", { ascending: true });
    const { data: votes } = await supabaseAdmin
      .from("votes")
      .select("player_id, question_id, choice")
      .limit(100000);

    return {
      players: (players ?? []).map((p) => ({
        name: p.display_name,
        answers: (votes ?? [])
          .filter((v) => v.player_id === p.id)
          .sort((a, b) => a.question_id - b.question_id)
          .map((v) => ({ questionId: v.question_id, choice: v.choice })),
      })),
    };
  });
