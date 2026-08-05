import type { AnswerRecord, QuizResult, ScoreMap, Test } from "@/types";

/**
 * Pure scoring logic — intentionally free of any React/UI dependency.
 *
 * - sums every answer's score contribution across all profiles
 * - highest total wins
 * - percentages always sum to exactly 100 (rounding delta goes to the winner)
 * - ties are broken by the number of high-scoring (>= 2) answers received
 */
export function calculateResult(test: Test, answers: AnswerRecord): QuizResult {
  const keys = test.resultProfiles.map((profile) => profile.key);

  const scores: ScoreMap = {};
  const highScoreCounts: ScoreMap = {};
  for (const key of keys) {
    scores[key] = 0;
    highScoreCounts[key] = 0;
  }

  for (const question of test.questions) {
    const answerId = answers[question.id];
    if (!answerId) continue;
    const answer = question.answers.find((item) => item.id === answerId);
    if (!answer) continue;

    for (const key of keys) {
      const value = answer.scores[key] ?? 0;
      scores[key] += value;
      if (value >= 2) highScoreCounts[key] += 1;
    }
  }

  const winnerKey = keys.reduce((best, key) => {
    if (scores[key] > scores[best]) return key;
    if (scores[key] === scores[best] && highScoreCounts[key] > highScoreCounts[best]) return key;
    return best;
  }, keys[0]);

  const percentages = buildPercentages(scores, keys, winnerKey);

  return { winnerKey, scores, percentages };
}

function buildPercentages(scores: ScoreMap, keys: string[], winnerKey: string): ScoreMap {
  const total = keys.reduce((sum, key) => sum + scores[key], 0);
  const percentages: ScoreMap = {};

  if (total <= 0) {
    const base = Math.floor(100 / keys.length);
    for (const key of keys) percentages[key] = base;
    percentages[winnerKey] += 100 - base * keys.length;
    return percentages;
  }

  let assigned = 0;
  for (const key of keys) {
    percentages[key] = Math.floor((scores[key] / total) * 100);
    assigned += percentages[key];
  }
  percentages[winnerKey] += 100 - assigned;

  return percentages;
}

export function sortedProfileKeys(result: QuizResult): string[] {
  return Object.keys(result.percentages).sort(
    (a, b) => result.percentages[b] - result.percentages[a],
  );
}
