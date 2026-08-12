const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-08-22" -> "8/22（土）" */
export function formatDateJp(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAYS_JA[date.getDay()];
  return `${month}/${day}（${weekday}）`;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start}〜${end}`;
}
