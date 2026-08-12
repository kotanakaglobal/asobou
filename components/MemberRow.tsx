"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMember } from "@/components/JoinGate";
import { renameMemberAction, deleteMemberAction } from "@/lib/actions/members";
import { clearStoredMember } from "@/lib/member-storage";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextInput, ErrorText } from "@/components/ui/Field";
import type { Member } from "@/lib/types";

export function MemberRow({ token, target }: { token: string; target: Member }) {
  const router = useRouter();
  const member = useMember();
  const isSelf = member.memberId === target.id;

  const [editing, setEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boundRename = renameMemberAction.bind(null, token, target.id);
  const [state, formAction, pending] = useActionState(boundRename, { error: null });

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled && !pending && state.error === null && editing) {
        setEditing(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  function handleDelete() {
    const confirmMessage = isSelf
      ? "グループから抜けますか？登録した空き時間・やりたいこと・投票もすべて削除されます。"
      : `${target.name}さんをグループから削除しますか？登録した空き時間・やりたいこと・投票もすべて削除されます。`;
    if (!window.confirm(confirmMessage)) return;

    startDeleteTransition(async () => {
      const result = await deleteMemberAction(token, target.id, member.memberId);
      if (result.error) {
        setDeleteError(result.error);
        return;
      }
      if (isSelf) {
        clearStoredMember(token);
        router.push("/");
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="memberId" value={member.memberId} />
          <TextInput
            name="name"
            defaultValue={target.name}
            required
            maxLength={40}
            autoFocus
            aria-label="名前"
          />
          <ErrorText>{state.error}</ErrorText>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="md" onClick={() => setEditing(false)} className="flex-1">
              キャンセル
            </Button>
            <Button type="submit" size="md" disabled={pending} className="flex-1">
              {pending ? "保存中..." : "保存する"}
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold text-ink">
          {target.name}
          {isSelf && <span className="ml-1.5 text-xs font-normal text-ink-faint">(あなた)</span>}
        </p>
        <div className="flex shrink-0 items-center gap-3 text-xs font-bold">
          <button type="button" onClick={() => setEditing(true)} className="text-brand-600 hover:underline">
            名前を変更
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-danger hover:underline"
          >
            {isDeleting ? "削除中..." : isSelf ? "グループから抜ける" : "削除"}
          </button>
        </div>
      </div>
      {deleteError && <p className="text-xs font-bold text-danger">{deleteError}</p>}
    </Card>
  );
}
