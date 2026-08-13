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
        <TextInput id="date" name="date" type="date" required autoFocus />
      </Field>

      <Field label="メモ" htmlFor="note" optional>
        <TextInput id="note" name="note" placeholder="たとえば「午前だけ」「19時以降なら」" maxLength={100} />
      </Field>

      <ErrorText>{state.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "保存中..." : "空いてる日を追加"}
      </Button>
    </form>
  );
}
