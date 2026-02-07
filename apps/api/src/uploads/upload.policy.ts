export type DeadlineMode = 'warn' | 'block';

export function evaluateDeadline(startTime: Date, hoursBefore: number, mode: DeadlineMode) {
  const limit = new Date(startTime.getTime() - hoursBefore * 60 * 60 * 1000);
  const now = new Date();
  const violation = now > limit;
  return { violation, mode, accepted: !(violation && mode === 'block'), limitAt: limit.toISOString() };
}

export function nextVersion(existing: Array<{ versionInt: number; isCurrent: boolean }>) {
  const max = existing.reduce((a, i) => Math.max(a, i.versionInt), 0);
  return max + 1;
}

export function markCurrent<T extends { id: string; isCurrent: boolean }>(items: T[], id: string) {
  return items.map((i) => ({ ...i, isCurrent: i.id === id }));
}
