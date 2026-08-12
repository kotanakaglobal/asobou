import "server-only";
import { getSupabaseClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/types";

type PlanRow = {
  id: string;
  group_id: string;
  idea_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  note: string | null;
  created_at: string;
  ideas: { title: string } | { title: string }[] | null;
};

function toHm(value: string): string {
  return value.slice(0, 5);
}

function ideaTitle(ideas: PlanRow["ideas"]): string | null {
  if (!ideas) return null;
  return Array.isArray(ideas) ? (ideas[0]?.title ?? null) : ideas.title;
}

function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    groupId: row.group_id,
    ideaId: row.idea_id,
    ideaTitle: ideaTitle(row.ideas),
    date: row.date,
    startTime: toHm(row.start_time),
    endTime: toHm(row.end_time),
    location: row.location,
    note: row.note,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS =
  "id, group_id, idea_id, date, start_time, end_time, location, note, created_at, ideas!idea_id(title)";

export async function createPlan(params: {
  groupId: string;
  ideaId: string | null;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  note: string | null;
}): Promise<Plan> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plans")
    .insert({
      group_id: params.groupId,
      idea_id: params.ideaId,
      date: params.date,
      start_time: params.startTime,
      end_time: params.endTime,
      location: params.location,
      note: params.note,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw new Error(`予定の作成に失敗しました: ${error.message}`);
  return toPlan(data as unknown as PlanRow);
}

export async function listPlansByGroup(groupId: string): Promise<Plan[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plans")
    .select(SELECT_COLUMNS)
    .eq("group_id", groupId)
    .order("date", { ascending: true });

  if (error) throw new Error(`予定の取得に失敗しました: ${error.message}`);
  return (data as unknown as PlanRow[]).map(toPlan);
}

export async function getPlan(groupId: string, planId: string): Promise<Plan | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("plans")
    .select(SELECT_COLUMNS)
    .eq("group_id", groupId)
    .eq("id", planId)
    .maybeSingle();

  if (error) throw new Error(`予定の取得に失敗しました: ${error.message}`);
  return data ? toPlan(data as unknown as PlanRow) : null;
}

export async function updatePlan(params: {
  groupId: string;
  planId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string | null;
  note: string | null;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("plans")
    .update({
      date: params.date,
      start_time: params.startTime,
      end_time: params.endTime,
      location: params.location,
      note: params.note,
    })
    .eq("group_id", params.groupId)
    .eq("id", params.planId);

  if (error) throw new Error(`予定の更新に失敗しました: ${error.message}`);
}

export async function deletePlan(groupId: string, planId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("plans").delete().eq("group_id", groupId).eq("id", planId);

  if (error) throw new Error(`予定の削除に失敗しました: ${error.message}`);
}
