"use client";

import { useActionState } from "react";
import { useMember } from "@/components/JoinGate";
import { addAvailabilityAction } from "@/lib/actions/availability";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, ErrorText } from "@/components/ui/Field";

export function AddAvailabilityForm({ token }: { token: string }) {
  const member = useMember();
  const boundAction = addAvailabilityAction.bind(null, token);
  const [state, formAction, pending] = useActionState(boundAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="memberId" value={member.memberId} />

      <Field label="日付" htmlFor="date">
        <TextInput id="date" name="date" type="date" required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="開始時間" htmlFor="startTime">
          <TextInput id="startTime" name="startTime" type="time" required />
        </Field>
        <Field label="終了時間" htmlFor="endTime">
          <TextInput id="endTime" name="endTime" type="time" required />
        </Field>
      </div>

      <Field label="メモ" htmlFor="note" optional>
        <TextInput id="note" name="note" placeholder="たとえば「夜だけなら」" maxLength={100} />
      </Field>

      <ErrorText>{state.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : "空きを追加"}
      </Button>
    </form>
  );
}
