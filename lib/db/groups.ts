import "server-only";
import { getSupabaseClient } from "@/lib/supabase/server";
import { generateShareToken } from "@/lib/token";
import type { Group } from "@/lib/types";

type GroupRow = {
  id: string;
  name: string;
  share_token: string;
  created_at: string;
};

function toGroup(row: GroupRow): Group {
  return {
    id: row.id,
    name: row.name,
    shareToken: row.share_token,
    createdAt: row.created_at,
  };
}

export async function getGroupByToken(token: string): Promise<Group | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("groups")
    .select("id, name, share_token, created_at")
    .eq("share_token", token)
    .maybeSingle();

  if (error) throw new Error(`グループの取得に失敗しました: ${error.message}`);
  return data ? toGroup(data as GroupRow) : null;
}

export async function createGroup(name: string): Promise<Group> {
  const supabase = getSupabaseClient();

  // share_token is generated app-side and is random enough that a collision
  // is astronomically unlikely; retry a couple of times defensively anyway.
  for (let attempt = 0; attempt < 3; attempt++) {
    const shareToken = generateShareToken();
    const { data, error } = await supabase
      .from("groups")
      .insert({ name, share_token: shareToken })
      .select("id, name, share_token, created_at")
      .single();

    if (!error) return toGroup(data as GroupRow);
    if (error.code !== "23505") {
      throw new Error(`グループの作成に失敗しました: ${error.message}`);
    }
    // 23505 = unique_violation on share_token, loop and retry with a new token.
  }

  throw new Error("グループの作成に失敗しました。もう一度お試しください。");
}
