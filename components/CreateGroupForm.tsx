"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGroupAction } from "@/lib/actions/group";
import { saveStoredMember } from "@/lib/member-storage";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, ErrorText } from "@/components/ui/Field";

export function CreateGroupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createGroupAction, { error: null });

  useEffect(() => {
    if (state.error === null && state.token && state.memberId && state.memberName) {
      saveStoredMember(state.token, { memberId: state.memberId, memberName: state.memberName });
      router.push(`/g/${state.token}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="グループ名" htmlFor="groupName">
        <TextInput
          id="groupName"
          name="groupName"
          placeholder="たとえば「大学の友達」"
          required
          maxLength={60}
          autoFocus
        />
      </Field>
      <Field label="あなたの名前" htmlFor="memberName">
        <TextInput id="memberName" name="memberName" placeholder="たとえば「たろう」" required maxLength={40} />
      </Field>
      <ErrorText>{state.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "作成中..." : "グループを作る"}
      </Button>
    </form>
  );
}
