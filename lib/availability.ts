import type { TimeRange } from "./types";

// Pure interval math — no I/O, fully unit-testable. Times are "HH:MM"
// strings, which sort and compare correctly as plain strings.

export type MemberInterval = TimeRange & { memberId: string };

function mergeIntervals(ranges: TimeRange[]): TimeRange[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
  const merged: TimeRange[] = [{ ...sorted[0] }];
  for (const range of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (range.start <= last.end) {
      last.end = range.end > last.end ? range.end : last.end;
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

function intersectTwo(a: TimeRange[], b: TimeRange[]): TimeRange[] {
  const result: TimeRange[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const start = a[i].start > b[j].start ? a[i].start : b[j].start;
    const end = a[i].end < b[j].end ? a[i].end : b[j].end;
    if (start < end) result.push({ start, end });
    if (a[i].end < b[j].end) i++;
    else j++;
  }
  return result;
}

/**
 * Given every member's registered intervals for a single date, returns the
 * distinct members who registered anything that date, and every disjoint
 * time range during which ALL of those members are free (sorted by start
 * time ascending, per spec — there can be more than one).
 */
export function computeCommonAvailability(entries: MemberInterval[]): {
  availableMemberIds: string[];
  commonRanges: TimeRange[];
} {
  const byMember = new Map<string, TimeRange[]>();
  for (const entry of entries) {
    const list = byMember.get(entry.memberId) ?? [];
    list.push({ start: entry.start, end: entry.end });
    byMember.set(entry.memberId, list);
  }

  const availableMemberIds = [...byMember.keys()];
  const mergedPerMember = availableMemberIds.map((id) => mergeIntervals(byMember.get(id)!));

  const commonRanges =
    mergedPerMember.length === 0
      ? []
      : mergedPerMember.reduce((acc, next) => intersectTwo(acc, next));

  return { availableMemberIds, commonRanges };
}
