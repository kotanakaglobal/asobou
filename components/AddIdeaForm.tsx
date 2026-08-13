"use client";

import { useActionState } from "react";
import { useMember } from "@/components/JoinGate";
import { addIdeaAction } from "@/lib/actions/ideas";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, ErrorText } from "@/components/ui/Field";

export function AddIdeaForm({ token }: { token: string }) {
  const member = useMember();
  const boundAction = addIdeaAction.bind(null, token);
  const [state, formAction, pending] = useActionState(boundAction, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="memberId" value={member.memberId} />

      <Field label="何したい？" htmlFor="title">
        <TextInput
          id="title"
          name="title"
          placeholder="たとえば「海行きたい」"
          required
          maxLength={80}
          autoFocus
        />
      </Field>

      <Field label="メモ" htmlFor="note" optional>
        <TextArea id="note" name="note" placeholder="場所の候補や補足があれば" rows={3} maxLength={300} />
      </Field>

      <ErrorText>{state.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "追加中..." : "追加する"}
      </Button>
    </form>
  );
}
