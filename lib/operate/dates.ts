// Dates are calendar days written as YYYY-MM-DD and read in UTC, so the server and the browser agree.
const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = toDate(value);
  return !Number.isNaN(date.getTime()) && toIso(date) === value;
}

export function addDays(iso: string, days: number): string {
  return toIso(new Date(toDate(iso).getTime() + days * DAY_MS));
}

export function nextMonday(now: Date): string {
  const today = toIso(now);
  const weekday = toDate(today).getUTCDay();
  return addDays(today, ((8 - weekday) % 7) || 7);
}

const FRIDAY = 5;

// The Friday closest to a day: from Saturday to Monday it steps back, from Tuesday to Thursday forward.
export function nearestFriday(iso: string): string {
  const weekday = toDate(iso).getUTCDay();
  return addDays(iso, (((FRIDAY - weekday + 3) % 7) + 7) % 7 - 3);
}

// A term ends on the Friday nearest its last day, so 26 weeks from a Monday ends on the Friday before.
export function termEndDate(start: string, weeks: number): string {
  return nearestFriday(addDays(start, weeks * 7 - 1));
}

export function formatDate(iso: string): string {
  return toDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
