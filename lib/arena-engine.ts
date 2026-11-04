import { topics, type TopicId } from "./learning";
import { questionBank, topicLabel, type GameQuestion } from "./topic-bank";

export interface ArenaPlayer {
  id: string;
  tokenHash: string;
  name: string;
  lives: number;
  score: number;
  joinedAt: number;
}

export interface ArenaAnswer {
  value: number | string;
  correct: boolean;
  answeredAt: number;
  elapsedMs: number;
}

export interface ArenaRoundResult {
  round: number;
  questionId: string;
  safeId: string | null;
  safeName: string | null;
  lostIds: string[];
  correctCount: number;
  message: string;
}

export interface ArenaMatch {
  id: string;
  code: string;
  hostId: string;
  topicId: TopicId;
  status: "lobby" | "playing" | "finished";
  players: ArenaPlayer[];
  questionIds: string[];
  round: number;
  roundStartedAt: number;
  roundEndsAt: number;
  nextAt: number;
  answers: Record<string, ArenaAnswer>;
  history: ArenaRoundResult[];
  winnerId: string | null;
  createdAt: number;
}

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_REGEX = /^[A-HJ-NP-Z2-9]{5}$/;

const allQuestionBanks = topics.flatMap((topic) => questionBank(topic.id));
export const bankById = new Map<string, GameQuestion>(
  allQuestionBanks.map((question) => [question.id, question]),
);

export function fisherYates(items: string[]): string[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function newCode(): string {
  return Array.from(
    { length: 5 },
    () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)],
  ).join("");
}

export function buildMatchQuestionOrder(topic: TopicId): string[] {
  const bank = questionBank(topic);
  const steps = [...new Set(bank.map((q) => q.step))].sort((a, b) => a - b);
  return steps.flatMap((step) =>
    fisherYates(bank.filter((q) => q.step === step).map((q) => q.id)),
  );
}

export function publicState(match: ArenaMatch, playerId: string) {
  const currentQuestion = bankById.get(match.questionIds[match.round]);
  const sortedPlayers = [...match.players].sort(
    (a, b) => b.lives - a.lives || b.score - a.score || a.joinedAt - b.joinedAt,
  );
  const topicId = match.topicId || "multiply";

  return {
    code: match.code,
    topicId,
    topicLabel: topicLabel(topicId),
    status: match.status,
    round: match.round + 1,
    totalRounds: match.questionIds.length,
    roundStartedAt: match.roundStartedAt,
    roundEndsAt: match.roundEndsAt,
    nextAt: match.nextAt,
    question:
      match.status === "playing" && match.roundStartedAt > 0 && currentQuestion
        ? {
            id: currentQuestion.id,
            concept: currentQuestion.concept,
            prompt: currentQuestion.prompt,
            seconds: currentQuestion.seconds,
            step: currentQuestion.step,
            options: currentQuestion.options,
          }
        : null,
    players: sortedPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      lives: player.lives,
      score: player.score,
      active: player.lives > 0,
      answered: Boolean(match.answers[player.id]),
      isYou: player.id === playerId,
    })),
    history: match.history.slice(-8),
    winnerId: match.winnerId,
    playerId,
    canStart:
      match.status === "lobby" &&
      match.hostId === playerId &&
      match.players.length >= 2,
    isHost: match.hostId === playerId,
    hasAnswered: Boolean(match.answers[playerId]),
    myAnswerCorrect: match.answers[playerId]?.correct ?? null,
    myLife: match.players.find((player) => player.id === playerId)?.lives ?? 0,
  };
}

export function beginRound(match: ArenaMatch, now = Date.now()): void {
  const question = bankById.get(match.questionIds[match.round]);
  if (!question) {
    match.status = "finished";
    return;
  }
  match.status = "playing";
  match.roundStartedAt = now;
  match.roundEndsAt = now + question.seconds * 1000;
  match.nextAt = 0;
  match.answers = {};
}

export function settle(match: ArenaMatch, now = Date.now()): void {
  const question = bankById.get(match.questionIds[match.round]);
  const alivePlayers = match.players.filter((player) => player.lives > 0);
  const correctSubmissions = alivePlayers
    .map((player) => ({ player, answer: match.answers[player.id] }))
    .filter((entry) => entry.answer?.correct)
    .sort((a, b) => a.answer.elapsedMs - b.answer.elapsedMs);

  const safePlayer = correctSubmissions[0]?.player ?? null;
  const lostIds: string[] = [];

  for (const player of alivePlayers) {
    if (player.id !== safePlayer?.id) {
      player.lives = Math.max(0, player.lives - 1);
      lostIds.push(player.id);
    }
  }

  if (safePlayer) {
    const answeredAt = match.answers[safePlayer.id]?.answeredAt ?? now;
    const speedBonus = Math.max(0, Math.floor((match.roundEndsAt - answeredAt) / 100));
    safePlayer.score += 100 + speedBonus;
  }

  const remainingPlayers = match.players.filter((player) => player.lives > 0);
  const message = safePlayer
    ? `${safePlayer.name} was the fastest correct!`
    : correctSubmissions.length
      ? "No safe answer this round."
      : "Time! Everyone lost a life.";

  match.history.push({
    round: match.round + 1,
    questionId: question?.id ?? "",
    safeId: safePlayer?.id ?? null,
    safeName: safePlayer?.name ?? null,
    lostIds,
    correctCount: correctSubmissions.length,
    message,
  });

  if (remainingPlayers.length <= 1) {
    match.status = "finished";
    match.winnerId = remainingPlayers[0]?.id ?? null;
    match.nextAt = 0;
  } else if (match.round + 1 >= match.questionIds.length) {
    match.status = "finished";
    match.winnerId =
      [...remainingPlayers].sort(
        (a, b) => b.score - a.score || b.lives - a.lives,
      )[0]?.id ?? null;
    match.nextAt = 0;
  } else {
    match.status = "playing";
    match.nextAt = now + 3600;
    match.roundStartedAt = 0;
    match.roundEndsAt = 0;
  }
}

export function advance(match: ArenaMatch, now: number): ArenaMatch {
  const allAliveAnswered = match.players
    .filter((player) => player.lives > 0)
    .every((player) => Boolean(match.answers[player.id]));

  if (
    match.status === "playing" &&
    match.roundStartedAt > 0 &&
    (now >= match.roundEndsAt || allAliveAnswered)
  ) {
    settle(match, now);
  }

  if (match.status === "playing" && match.nextAt > 0 && now >= match.nextAt) {
    match.round++;
    beginRound(match, now);
  }

  return match;
}
