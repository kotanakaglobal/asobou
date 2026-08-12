// Pure validation helpers shared by Server Actions and (optionally) client
// forms. No dependencies, no I/O — safe to import from anywhere.

export class ValidationError extends Error {}

export function requireNonEmpty(value: FormDataEntryValue | null, fieldLabel: string): string {
  const str = typeof value === "string" ? value.trim() : "";
  if (!str) {
    throw new ValidationError(`${fieldLabel}を入力してください。`);
  }
  return str;
}

export function optionalTrimmed(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str.length > 0 ? str : null;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function requireValidDate(value: FormDataEntryValue | null): string {
  const str = requireNonEmpty(value, "日付");
  if (!DATE_RE.test(str) || Number.isNaN(new Date(`${str}T00:00:00`).getTime())) {
    throw new ValidationError("日付が正しくありません。");
  }
  return str;
}

export function requireValidTimeRange(
  startValue: FormDataEntryValue | null,
  endValue: FormDataEntryValue | null
): { start: string; end: string } {
  const start = requireNonEmpty(startValue, "開始時間");
  const end = requireNonEmpty(endValue, "終了時間");
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) {
    throw new ValidationError("時間の形式が正しくありません。");
  }
  if (start >= end) {
    throw new ValidationError("開始時間は終了時間より前にしてください。");
  }
  return { start, end };
}

export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}
