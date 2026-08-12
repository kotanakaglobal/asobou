"use server";

import { createGroup } from "@/lib/db/groups";
import { createMember } from "@/lib/db/members";
import { assertMemberInGroup } from "@/lib/db/members";
import { getGroupByToken } from "@/lib/db/groups";
import { requireNonEmpty } from "@/lib/validation";
import { toErrorMessage } from "@/lib/actions/shared";

export type CreateGroupState = {
  error: string | null;
  token?: string;
  memberId?: string;
  memberName?: string;
};

export async function createGroupAction(
  _prevState: CreateGroupState,
  formData: FormData
): Promise<CreateGroupState> {
  try {
    const groupName = requireNonEmpty(formData.get("groupName"), "グループ名");
    const memberName = requireNonEmpty(formData.get("memberName"), "あなたの名前");

    const group = await createGroup(groupName);
    const member = await createMember(group.id, memberName);

    return { error: null, token: group.shareToken, memberId: member.id, memberName: member.name };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export type JoinGroupState = {
  error: string | null;
  memberId?: string;
  memberName?: string;
};

export async function joinGroupAction(
  token: string,
  _prevState: JoinGroupState,
  formData: FormData
): Promise<JoinGroupState> {
  try {
    const memberName = requireNonEmpty(formData.get("memberName"), "あなたの名前");

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };

    const member = await createMember(group.id, memberName);
    return { error: null, memberId: member.id, memberName: member.name };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

/** Used by the client to make sure a memberId found in localStorage is still
 * a real member of this group before trusting it (e.g. group data was reset). */
export async function verifyMembershipAction(
  token: string,
  memberId: string
): Promise<boolean> {
  try {
    const group = await getGroupByToken(token);
    if (!group) return false;
    await assertMemberInGroup(group.id, memberId);
    return true;
  } catch {
    return false;
  }
}
