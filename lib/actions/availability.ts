"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getGroupByToken } from "@/lib/db/groups";
import { assertMemberInGroup } from "@/lib/db/members";
import { addAvailability, updateAvailability, deleteAvailability } from "@/lib/db/availability";
import { requireNonEmpty, requireValidDate, requireValidTimeRange, optionalTrimmed } from "@/lib/validation";
import { toErrorMessage, type ActionState } from "@/lib/actions/shared";

export async function addAvailabilityAction(
  token: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = requireNonEmpty(formData.get("memberId"), "参加者情報");
    const date = requireValidDate(formData.get("date"));
    const { start, end } = requireValidTimeRange(formData.get("startTime"), formData.get("endTime"));
    const note = optionalTrimmed(formData.get("note"));

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, memberId);

    await addAvailability({
      groupId: group.id,
      memberId,
      date,
      startTime: start,
      endTime: end,
      note,
    });

    revalidatePath(`/g/${token}`);
    revalidatePath(`/g/${token}/availability`);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  redirect(`/g/${token}/availability`);
}

export async function updateAvailabilityAction(
  token: string,
  availabilityId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const memberId = requireNonEmpty(formData.get("memberId"), "参加者情報");
    const date = requireValidDate(formData.get("date"));
    const { start, end } = requireValidTimeRange(formData.get("startTime"), formData.get("endTime"));
    const note = optionalTrimmed(formData.get("note"));

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, memberId);

    await updateAvailability({
      groupId: group.id,
      availabilityId,
      memberId,
      date,
      startTime: start,
      endTime: end,
      note,
    });

    revalidatePath(`/g/${token}`);
    revalidatePath(`/g/${token}/availability`);
    return { error: null };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export async function deleteAvailabilityAction(
  token: string,
  availabilityId: string,
  memberId: string
): Promise<{ error: string | null }> {
  try {
    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };
    await assertMemberInGroup(group.id, memberId);

    await deleteAvailability({ groupId: group.id, availabilityId, memberId });

    revalidatePath(`/g/${token}`);
    revalidatePath(`/g/${token}/availability`);
    return { error: null };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}
