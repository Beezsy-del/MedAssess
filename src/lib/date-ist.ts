/** Convert a Date to an Asia/Kolkata `datetime-local` input value (YYYY-MM-DDTHH:mm). */
export function toIstLocalInput(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** Normalize either a `datetime-local` string or an explicit ISO offset string to ISO +05:30. */
export function normalizeIstIso(raw: string) {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed))
    return `${trimmed}:00+05:30`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed))
    return `${trimmed}+05:30`;
  return trimmed;
}
