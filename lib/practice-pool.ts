export function pickPracticeQuestion<T extends { prompt: string }>(
  pool: readonly T[], previous: readonly string[]
): T {
  const lastSeen = new Map(previous.map((prompt, index) => [prompt, index]));
  const unseen = pool.filter(q => !lastSeen.has(q.prompt));
  if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)];
  return pool.reduce((first, q) =>
    lastSeen.get(q.prompt)! < lastSeen.get(first.prompt)! ? q : first
  );
}
