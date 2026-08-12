"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { updatePlanAction, deletePlanAction } from "@/lib/actions/plans";
import { formatDateJp, formatTimeRange } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput, TextArea, ErrorText } from "@/components/ui/Field";
import type { Plan } from "@/lib/types";

export function PlanDetail({
  token,
  plan,
  memberNames,
}: {
  token: string;
  plan: Plan;
  memberNames: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boundUpdate = updatePlanAction.bind(null, token, plan.id);
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
    if (!window.confirm("この予定を削除しますか？")) return;
    startDeleteTransition(async () => {
      const result = await deletePlanAction(token, plan.id);
      if (result.error) setDeleteError(result.error);
    });
  }

  if (editing) {
    return (
      <form action={formAction} className="flex flex-col gap-5">
        <Field label="日付" htmlFor="date">
          <TextInput id="date" name="date" type="date" required defaultValue={plan.date} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="開始時間" htmlFor="startTime">
            <TextInput id="startTime" name="startTime" type="time" required defaultValue={plan.startTime} />
          </Field>
          <Field label="終了時間" htmlFor="endTime">
            <TextInput id="endTime" name="endTime" type="time" required defaultValue={plan.endTime} />
          </Field>
        </div>
        <Field label="場所" htmlFor="location" optional>
          <TextInput id="location" name="location" defaultValue={plan.location ?? ""} maxLength={100} />
        </Field>
        <Field label="メモ" htmlFor="note" optional>
          <TextArea id="note" name="note" rows={3} defaultValue={plan.note ?? ""} maxLength={300} />
        </Field>
        <ErrorText>{state.error}</ErrorText>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="flex-1">
            キャンセル
          </Button>
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? "保存中..." : "保存する"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-ink-soft">やること</p>
          <p className="text-2xl font-extrabold text-ink">{plan.ideaTitle ?? "予定"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-ink-soft">日時</p>
          <p className="text-base font-bold text-ink">
            {formatDateJp(plan.date)} {formatTimeRange(plan.startTime, plan.endTime)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-ink-soft">参加メンバー</p>
          <p className="text-sm text-ink">{memberNames.join("、")}</p>
        </div>
        {plan.location && (
          <div>
            <p className="text-xs font-bold text-ink-soft">場所</p>
            <p className="text-sm text-ink">{plan.location}</p>
          </div>
        )}
        {plan.note && (
          <div>
            <p className="text-xs font-bold text-ink-soft">メモ</p>
            <p className="whitespace-pre-wrap text-sm text-ink">{plan.note}</p>
          </div>
        )}
      </Card>

      <ErrorText>{deleteError}</ErrorText>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={() => setEditing(true)} className="flex-1">
          編集する
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="flex-1">
          {isDeleting ? "削除中..." : "削除する"}
        </Button>
      </div>
    </div>
  );
}
