"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useMember } from "@/components/JoinGate";
import { updateAvailabilityAction, deleteAvailabilityAction } from "@/lib/actions/availability";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, ErrorText } from "@/components/ui/Field";
import type { Availability } from "@/lib/types";

export function AvailabilityEntryRow({ token, entry }: { token: string; entry: Availability }) {
  const member = useMember();
  const isOwner = member.memberId === entry.memberId;
  const [editing, setEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boundUpdate = updateAvailabilityAction.bind(null, token, entry.id);
  const [state, formAction, pending] = useActionState(boundUpdate, { error: null });

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
    if (!window.confirm("この空いてる日を削除しますか？")) return;
    startDeleteTransition(async () => {
      const result = await deleteAvailabilityAction(token, entry.id, member.memberId);
      if (result.error) setDeleteError(result.error);
    });
  }

  if (editing) {
    return (
      <li className="rounded-xl border border-brand-200 bg-brand-50 p-3">
        <form action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="memberId" value={member.memberId} />
          <Field label="日付" htmlFor={`date-${entry.id}`}>
            <TextInput id={`date-${entry.id}`} name="date" type="date" required defaultValue={entry.date} />
          </Field>
          <Field label="メモ" htmlFor={`note-${entry.id}`} optional>
            <TextInput id={`note-${entry.id}`} name="note" defaultValue={entry.note ?? ""} maxLength={100} />
          </Field>
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
      </li>
    );
  }

  return (
    <li className="flex flex-col gap-1 text-sm text-ink-soft">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-bold text-ink">
          {entry.memberName}
          {entry.note && <span className="ml-1.5 font-normal text-ink-faint">（{entry.note}）</span>}
        </span>
        {isOwner && (
          <span className="flex shrink-0 items-center gap-2 text-xs font-bold">
            <button type="button" onClick={() => setEditing(true)} className="text-brand-600 hover:underline">
              編集
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-danger hover:underline"
            >
              {isDeleting ? "削除中..." : "削除"}
            </button>
          </span>
        )}
      </div>
      {deleteError && <p className="text-xs font-bold text-danger">{deleteError}</p>}
    </li>
  );
}
