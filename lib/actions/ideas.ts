"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getGroupByToken } from "@/lib/db/groups";
import { assertMemberInGroup } from "@/lib/db/members";
import { createIdea, voteForIdea, unvoteIdea } from "@/lib/db/ideas";
import { requireNonEmpty, optionalTrimmed } from "@/lib/validation";
import { toErrorMessage, type ActionState } from "@/lib/actions/shared";

export async function addIdeaAction(
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = requireNonEmpty(formData.get("memberId"), "参加者情報");
    const title = requireNonEmpty(formData.get("title"), "やりたいこと");
    const note = optionalTrimmed(formData.get("note"));

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, memberId);

    await createIdea({ groupId: group.id, memberId, title, note });

    revalidatePath(`/g/${token}`);
    revalidatePath(`/g/${token}/ideas`);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  redirect(`/g/${token}/ideas`);
}

export async function voteIdeaAction(
  token: string,
  groupId: string,
  ideaId: string,
  memberId: string
): Promise<{ error: string | null }> {
  try {
    await assertMemberInGroup(groupId, memberId);
    await voteForIdea(ideaId, memberId);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  revalidatePath(`/g/${token}`);
  revalidatePath(`/g/${token}/ideas`);
  revalidatePath(`/g/${token}/ideas/${ideaId}`);
  return { error: null };
}

export async function unvoteIdeaAction(
  token: string,
  groupId: string,
  ideaId: string,
  memberId: string
): Promise<{ error: string | null }> {
  try {
    await assertMemberInGroup(groupId, memberId);
    await unvoteIdea(ideaId, memberId);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  revalidatePath(`/g/${token}`);
  revalidatePath(`/g/${token}/ideas`);
  revalidatePath(`/g/${token}/ideas/${ideaId}`);
  return { error: null };
}
