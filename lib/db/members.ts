import "server-only";
import { getSupabaseClient } from "@/lib/supabase/server";
import { ValidationError } from "@/lib/validation";
import type { Member } from "@/lib/types";

type MemberRow = {
  id: string;
  group_id: string;
  name: string;
  created_at: string;
};

function toMember(row: MemberRow): Member {
  return { id: row.id, groupId: row.group_id, name: row.name, createdAt: row.created_at };
}

export async function createMember(groupId: string, name: string): Promise<Member> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .insert({ group_id: groupId, name })
    .select("id, group_id, name, created_at")
    .single();

  if (error) throw new Error(`参加処理に失敗しました: ${error.message}`);
  return toMember(data as MemberRow);
}

export async function listMembers(groupId: string): Promise<Member[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, group_id, name, created_at")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`メンバーの取得に失敗しました: ${error.message}`);
  return (data as MemberRow[]).map(toMember);
}

export async function renameMember(groupId: string, memberId: string, name: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .update({ name })
    .eq("id", memberId)
    .eq("group_id", groupId)
    .select("id");

  if (error) throw new Error(`名前の変更に失敗しました: ${error.message}`);
  if (!data || data.length === 0) {
    throw new ValidationError("このメンバーが見つかりませんでした。");
  }
}

export async function deleteMember(groupId: string, memberId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .eq("group_id", groupId)
    .select("id");

  if (error) throw new Error(`メンバーの削除に失敗しました: ${error.message}`);
  if (!data || data.length === 0) {
    throw new ValidationError("このメンバーが見つかりませんでした。");
  }
}

/**
 * Confirms memberId is a real member of this group before an action is
 * allowed to act on their behalf. This is the MVP's only defense against a
 * client sending a memberId that doesn't belong to them — see README for the
 * accepted trust model (no login means member identity can't be
 * cryptographically verified).
 */
export async function assertMemberInGroup(groupId: string, memberId: string): Promise<Member> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("members")
    .select("id, group_id, name, created_at")
    .eq("group_id", groupId)
    .eq("id", memberId)
    .maybeSingle();

  if (error) throw new Error(`メンバーの確認に失敗しました: ${error.message}`);
  if (!data) throw new Error("メンバー情報が確認できませんでした。もう一度参加し直してください。");
  return toMember(data as MemberRow);
}
