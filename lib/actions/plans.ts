"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getGroupByToken } from "@/lib/db/groups";
import { createPlan, updatePlan, deletePlan } from "@/lib/db/plans";
import {
  requireValidDate,
  requireValidTimeRange,
  optionalTrimmed,
} from "@/lib/validation";
import { toErrorMessage, type ActionState } from "@/lib/actions/shared";

export async function createPlanAction(
  token: string,
  ideaId: string | null,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  let planId: string;

  try {
    const date = requireValidDate(formData.get("date"));
    const { start, end } = requireValidTimeRange(formData.get("startTime"), formData.get("endTime"));
    const location = optionalTrimmed(formData.get("location"));
    const note = optionalTrimmed(formData.get("note"));

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };

    const plan = await createPlan({
      groupId: group.id,
      ideaId,
      date,
      startTime: start,
      endTime: end,
      location,
      note,
    });
    planId = plan.id;

    revalidatePath(`/g/${token}`);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  redirect(`/g/${token}/plans/${planId}`);
}

export async function updatePlanAction(
  token: string,
  planId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const date = requireValidDate(formData.get("date"));
    const { start, end } = requireValidTimeRange(formData.get("startTime"), formData.get("endTime"));
    const location = optionalTrimmed(formData.get("location"));
    const note = optionalTrimmed(formData.get("note"));

    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };

    await updatePlan({
      groupId: group.id,
      planId,
      date,
      startTime: start,
      endTime: end,
      location,
      note,
    });

    revalidatePath(`/g/${token}`);
    revalidatePath(`/g/${token}/plans/${planId}`);
    return { error: null };
  } catch (err) {
    return { error: toErrorMessage(err) };
  }
}

export async function deletePlanAction(token: string, planId: string): Promise<{ error: string | null }> {
  try {
    const group = await getGroupByToken(token);
    if (!group) return { error: "このグループは見つかりません" };

    await deletePlan(group.id, planId);
    revalidatePath(`/g/${token}`);
  } catch (err) {
    return { error: toErrorMessage(err) };
  }

  redirect(`/g/${token}`);
}
