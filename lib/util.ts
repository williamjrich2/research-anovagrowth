import { formatDistanceToNowStrict } from "date-fns";

export function relativeTime(iso: string): string {
  const ms = Date.now() - +new Date(iso);
  if (ms < 60_000) return "just now";
  const s = formatDistanceToNowStrict(new Date(iso));
  return s
    .replace(" seconds", "s")
    .replace(" second", "s")
    .replace(" minutes", "m")
    .replace(" minute", "m")
    .replace(" hours", "h")
    .replace(" hour", "h")
    .replace(" days", "d")
    .replace(" day", "d")
    .replace(" months", "mo")
    .replace(" month", "mo")
    .replace(" years", "y")
    .replace(" year", "y");
}

export function absoluteDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sumReactions(r: Partial<Record<string, number>>): number {
  return Object.values(r).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + "k";
  return (n / 1_000_000).toFixed(1) + "m";
}
