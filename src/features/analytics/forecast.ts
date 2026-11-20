export function forecast(arrivals: string[], days: number) {
  if (days < 7 || arrivals.length < 14)
    return {
      available: false as const,
      reason:
        "At least 7 complete days and 14 arrivals are required for this demonstration forecast.",
    };
  const counts = Array.from({ length: 24 }, () => 0);
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hourCycle: "h23",
  });
  for (const time of arrivals) counts[Number(format.format(new Date(time)))]++;
  return {
    available: true as const,
    days,
    hours: counts.map((count, hour) => ({
      hour,
      expected: Math.round((count / days) * 10) / 10,
    })),
    method:
      "Mean arrivals per hour across complete observed days, Asia/Kolkata. Descriptive baseline; not a clinical prediction.",
  };
}
