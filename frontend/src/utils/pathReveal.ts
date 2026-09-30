export function filterPathForReveal(
  path: [number, number][],
  revealIndex: number
): [number, number][] {
  if (path.length === 0 || revealIndex < 0) return [];
  const end = Math.min(path.length, revealIndex + 1);
  return path.slice(0, end);
}
