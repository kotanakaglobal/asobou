"use server";

import { revalidatePath } from "next/cache";
import { getGroupByToken } from "@/lib/db/groups";
import { assertMemberInGroup, renameMember, deleteMember } from "@/lib/db/members";
import { requireNonEmpty } from "@/lib/validation";
import { toErrorMessage, type ActionState } from "@/lib/actions/shared";

export async function renameMemberAction(
  token: string,
  targetMemberId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const actingMemberId = requireNonEmpty(formData.get("memberId"), "参加者情報");
    const name = requireNonEmpty(formData.get("name"), "名前");

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, actingMemberId);

    await renameMember(group.id, targetMemberId, name);

    revalidatePath("/g/[token]", "layout");
    return { error: null };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export async function deleteMemberAction(
  token: string,
  targetMemberId: string,
  actingMemberId: string
): Promise<{ error: string | null }> {
  try {
    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, actingMemberId);

    await deleteMember(group.id, targetMemberId);

    revalidatePath("/g/[token]", "layout");
    return { error: null };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}
