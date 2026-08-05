import type { AnalyticsEvent } from "@/utils/analytics";
import { readAnalyticsEvents } from "@/utils/analytics";

export interface TestMetrics {
  views: number;
  starts: number;
  completions: number;
  previews: number;
  unlockClicks: number;
  unlocks: number;
  shares: number;
}

const emptyMetrics: TestMetrics = {
  views: 0,
  starts: 0,
  completions: 0,
  previews: 0,
  unlockClicks: 0,
  unlocks: 0,
  shares: 0,
};

const fieldByEvent: Partial<Record<AnalyticsEvent, keyof TestMetrics>> = {
  test_viewed: "views",
  test_started: "starts",
  test_completed: "completions",
  result_preview_viewed: "previews",
  unlock_clicked: "unlockClicks",
  result_unlocked: "unlocks",
  share_clicked: "shares",
};

export function getMetricsByTest(): Record<string, TestMetrics> {
  const result: Record<string, TestMetrics> = {};
  for (const event of readAnalyticsEvents()) {
    const field = fieldByEvent[event.event];
    if (!field) continue;
    if (!result[event.testId]) result[event.testId] = { ...emptyMetrics };
    result[event.testId][field] += 1;
  }
  return result;
}

export function metricsFor(testId: string, all: Record<string, TestMetrics>): TestMetrics {
  return all[testId] ?? { ...emptyMetrics };
}

export function sumMetrics(list: TestMetrics[]): TestMetrics {
  return list.reduce<TestMetrics>(
    (acc, item) => ({
      views: acc.views + item.views,
      starts: acc.starts + item.starts,
      completions: acc.completions + item.completions,
      previews: acc.previews + item.previews,
      unlockClicks: acc.unlockClicks + item.unlockClicks,
      unlocks: acc.unlocks + item.unlocks,
      shares: acc.shares + item.shares,
    }),
    { ...emptyMetrics },
  );
}
