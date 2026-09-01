export const FRIENDS = [
  "Ruben",
  "Rhia",
  "Niya",
  "Zach",
  "Nathan",
  "Josh",
  "Esther",
  "Isha",
] as const;

export type Friend = (typeof FRIENDS)[number];

export const QUESTIONS: string[] = [
  "Who looks the best?",
  "Who has the best style?",
  "Who is the funniest?",
  "Who is the nicest?",
  "Who is the smartest?",
  "Who is the most trustworthy?",
  "Who gives the best advice?",
  "Who has the best music taste?",
  "Who is most likely to become successful?",
  "Who is most likely to become famous?",
  "Who is most likely to be rich?",
  "Who is the most chaotic?",
  "Who is the most dramatic?",
  "Who is the biggest yapper?",
  "Who is most likely to be late?",
  "Who is worst at replying?",
  "Who is most likely to start an argument?",
  "Who is most likely to embarrass themselves?",
  "Who is most likely to make a terrible decision?",
  "Who would be the best person to go on a road trip with?",
  "Who would be the worst person to go on vacation with?",
  "Who would survive longest in a zombie apocalypse?",
  "Who would accidentally become famous?",
  "Who would make the best leader?",
  "Who would be the best teammate?",
  "Who is the most competitive?",
  "Who is the most caring?",
  "Who is the easiest to talk to?",
  "Who would you trust with a secret?",
  "Who would make the best date?",
  "Who would be the most nervous on a first date?",
  "Who would be the best at flirting?",
  "Who would catch feelings first?",
  "Who would overthink a text from someone they like?",
  "Who would be easiest to make blush?",
  "Who would give the best relationship advice?",
  "Who is most likely to become a millionaire?",
  "Who is most likely to travel the world?",
  "Who would have the craziest future?",
  "Who is most likely to surprise everyone?",
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

/** Deterministic per-question shuffle so SSR and client render the same order. */
function seededRandom(seed: number) {
  let state = seed * 2654435761 + 1013904223;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

export function namesForQuestion(questionId: number): Friend[] {
  const rand = seededRandom(questionId + 7);
  const names = [...FRIENDS];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = names[i]!;
    names[i] = names[j]!;
    names[j] = tmp;
  }
  return names;
}

export const FRIEND_COLORS: Record<Friend, string> = {
  Ruben: "var(--chart-1)",
  Rhia: "var(--chart-2)",
  Niya: "var(--chart-3)",
  Zach: "var(--chart-4)",
  Nathan: "var(--chart-5)",
  Josh: "var(--chart-6)",
  Esther: "var(--chart-7)",
  Isha: "var(--chart-8)",
};
