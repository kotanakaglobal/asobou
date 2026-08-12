import "server-only";
import { getSupabaseClient } from "@/lib/supabase/server";
import { computeCommonAvailability, type MemberInterval } from "@/lib/availability";
import type { Availability, DateAvailabilitySummary } from "@/lib/types";

type AvailabilityRow = {
  id: string;
  group_id: string;
  member_id: string;
  date: string;
  start_time: string;
  end_time: string;
  note: string | null;
  created_at: string;
  members: { name: string } | { name: string }[] | null;
};

// Postgres `time` columns come back as "HH:MM:SS" — trim to "HH:MM".
function toHm(value: string): string {
  return value.slice(0, 5);
}

function memberName(members: AvailabilityRow["members"]): string {
  if (!members) return "";
  return Array.isArray(members) ? (members[0]?.name ?? "") : members.name;
}

function toAvailability(row: AvailabilityRow): Availability {
  return {
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    memberName: memberName(row.members),
    date: row.date,
    startTime: toHm(row.start_time),
    endTime: toHm(row.end_time),
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function addAvailability(params: {
  groupId: string;
  memberId: string;
  date: string;
  startTime: string;
  endTime: string;
  note: string | null;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("availability").insert({
    group_id: params.groupId,
    member_id: params.memberId,
    date: params.date,
    start_time: params.startTime,
    end_time: params.endTime,
    note: params.note,
  });

  if (error) throw new Error(`空き時間の登録に失敗しました: ${error.message}`);
}

export async function listAvailabilityByGroup(groupId: string): Promise<Availability[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("availability")
    .select("id, group_id, member_id, date, start_time, end_time, note, created_at, members(name)")
    .eq("group_id", groupId)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(`空き時間の取得に失敗しました: ${error.message}`);
  return (data as unknown as AvailabilityRow[]).map(toAvailability);
}

/**
 * Groups every registered availability entry by date and computes, per date,
 * how many members are covered and the common free time range(s) across
 * exactly those members (pure logic lives in lib/availability.ts).
 */
export function summarizeByDate(
  entries: Availability[],
  totalMembers: number
): DateAvailabilitySummary[] {
  const byDate = new Map<string, Availability[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry);
    byDate.set(entry.date, list);
  }

  const summaries: DateAvailabilitySummary[] = [];
  for (const [date, dayEntries] of byDate) {
    const intervals: MemberInterval[] = dayEntries.map((e) => ({
      memberId: e.memberId,
      start: e.startTime,
      end: e.endTime,
    }));
    const { availableMemberIds, commonRanges } = computeCommonAvailability(intervals);
    const namesById = new Map(dayEntries.map((e) => [e.memberId, e.memberName]));

    summaries.push({
      date,
      totalMembers,
      availableCount: availableMemberIds.length,
      availableMemberNames: availableMemberIds.map((id) => namesById.get(id) ?? ""),
      commonRanges,
      entries: dayEntries,
    });
  }

  return summaries.sort((a, b) => a.date.localeCompare(b.date));
}
