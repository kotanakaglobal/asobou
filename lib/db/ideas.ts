import "server-only";
import { getSupabaseClient } from "@/lib/supabase/server";
import { normalizeTitle, ValidationError } from "@/lib/validation";
import type { Idea, IdeaWithVotes } from "@/lib/types";

type IdeaRow = {
  id: string;
  group_id: string;
  member_id: string;
  title: string;
  created_at: string;
  members: { name: string } | { name: string }[] | null;
};

type VoteRow = {
  idea_id: string;
  member_id: string;
  members: { name: string } | { name: string }[] | null;
};

function memberName(members: IdeaRow["members"]): string {
  if (!members) return "";
  return Array.isArray(members) ? (members[0]?.name ?? "") : members.name;
}

export async function createIdea(params: {
  groupId: string;
  memberId: string;
  title: string;
}): Promise<Idea> {
  const supabase = getSupabaseClient();
  const normalizedTitle = normalizeTitle(params.title);

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      group_id: params.groupId,
      member_id: params.memberId,
      title: params.title,
      normalized_title: normalizedTitle,
    })
    .select("id, group_id, member_id, title, created_at, members(name)")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ValidationError("同じやりたいことが既に登録されています。");
    }
    throw new Error(`やりたいことの登録に失敗しました: ${error.message}`);
  }

  const row = data as unknown as IdeaRow;
  return {
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    memberName: memberName(row.members),
    title: row.title,
    createdAt: row.created_at,
    voteCount: 0,
  };
}

export async function listIdeasByGroup(groupId: string): Promise<Idea[]> {
  const supabase = getSupabaseClient();

  const { data: ideaRows, error: ideaError } = await supabase
    .from("ideas")
    .select("id, group_id, member_id, title, created_at, members(name)")
    .eq("group_id", groupId);

  if (ideaError) throw new Error(`やりたいことの取得に失敗しました: ${ideaError.message}`);

  const ideaIds = (ideaRows as unknown as IdeaRow[]).map((row) => row.id);
  const voteCountByIdea = new Map<string, number>();

  if (ideaIds.length > 0) {
    const { data: voteRows, error: voteError } = await supabase
      .from("idea_votes")
      .select("idea_id")
      .in("idea_id", ideaIds);

    if (voteError) throw new Error(`投票の取得に失敗しました: ${voteError.message}`);

    for (const vote of voteRows as { idea_id: string }[]) {
      voteCountByIdea.set(vote.idea_id, (voteCountByIdea.get(vote.idea_id) ?? 0) + 1);
    }
  }

  return (ideaRows as unknown as IdeaRow[]).map((row) => ({
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    memberName: memberName(row.members),
    title: row.title,
    createdAt: row.created_at,
    voteCount: voteCountByIdea.get(row.id) ?? 0,
  }));
}

export async function getIdeaWithVotes(
  groupId: string,
  ideaId: string
): Promise<IdeaWithVotes | null> {
  const supabase = getSupabaseClient();

  const { data: ideaRow, error: ideaError } = await supabase
    .from("ideas")
    .select("id, group_id, member_id, title, created_at, members(name)")
    .eq("group_id", groupId)
    .eq("id", ideaId)
    .maybeSingle();

  if (ideaError) throw new Error(`やりたいことの取得に失敗しました: ${ideaError.message}`);
  if (!ideaRow) return null;

  const { data: voteRows, error: voteError } = await supabase
    .from("idea_votes")
    .select("idea_id, member_id, members(name)")
    .eq("idea_id", ideaId);

  if (voteError) throw new Error(`投票の取得に失敗しました: ${voteError.message}`);

  const votes = voteRows as unknown as VoteRow[];
  const row = ideaRow as unknown as IdeaRow;

  return {
    id: row.id,
    groupId: row.group_id,
    memberId: row.member_id,
    memberName: memberName(row.members),
    title: row.title,
    createdAt: row.created_at,
    voteCount: votes.length,
    voterIds: votes.map((v) => v.member_id),
    voterNames: votes.map((v) => memberName(v.members)),
  };
}

export async function voteForIdea(ideaId: string, memberId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("idea_votes")
    .insert({ idea_id: ideaId, member_id: memberId });

  // 23505 = already voted (unique constraint) — treat as success, it's idempotent.
  if (error && error.code !== "23505") {
    throw new Error(`投票に失敗しました: ${error.message}`);
  }
}

export async function unvoteIdea(ideaId: string, memberId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("idea_votes")
    .delete()
    .eq("idea_id", ideaId)
    .eq("member_id", memberId);

  if (error) throw new Error(`投票の取り消しに失敗しました: ${error.message}`);
}
