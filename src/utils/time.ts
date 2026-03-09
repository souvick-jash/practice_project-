type TimeUnit =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";
type OutputUnit = "ms" | "s" | "milliseconds" | "seconds";

export function timeConverter(
  value: number,
  type: TimeUnit = "second",
  output: OutputUnit = "ms",
): number {
  const timeUnitsInSeconds: Record<TimeUnit, number> = {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000, // 30 days approximation
    year: 31536000, // 365 days approximation
  };

  const seconds = value * timeUnitsInSeconds[type];

  return output === "s" || output === "seconds" ? seconds : seconds * 1000;
}
