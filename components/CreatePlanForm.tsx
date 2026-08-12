"use client";

import { useActionState, useState } from "react";
import { createPlanAction } from "@/lib/actions/plans";
import { formatDateJp, formatTimeRange } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, ErrorText } from "@/components/ui/Field";
import type { DateAvailabilitySummary } from "@/lib/types";

export function CreatePlanForm({
  token,
  ideaId,
  ideaTitle,
  dateCandidates,
  memberNames,
}: {
  token: string;
  ideaId: string | null;
  ideaTitle: string | null;
  dateCandidates: DateAvailabilitySummary[];
  memberNames: string[];
}) {
  const boundAction = createPlanAction.bind(null, token, ideaId);
  const [state, formAction, pending] = useActionState(boundAction, { error: null });

  const top = dateCandidates[0];
  const [date, setDate] = useState(top?.date ?? "");
  const [startTime, setStartTime] = useState(top?.commonRanges[0]?.start ?? "");
  const [endTime, setEndTime] = useState(top?.commonRanges[0]?.end ?? "");

  function pickCandidate(candidate: DateAvailabilitySummary) {
    setDate(candidate.date);
    if (candidate.commonRanges[0]) {
      setStartTime(candidate.commonRanges[0].start);
      setEndTime(candidate.commonRanges[0].end);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {ideaTitle && (
        <div>
          <p className="text-xs font-bold text-ink-soft">アイデア</p>
          <p className="text-lg font-extrabold text-ink">{ideaTitle}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-bold text-ink-soft">参加メンバー</p>
        <p className="text-sm text-ink">{memberNames.join("、")}</p>
      </div>

      {dateCandidates.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-ink-soft">候補日（タップで入力）</p>
          <div className="flex flex-col gap-2">
            {dateCandidates.map((candidate) => {
              const isFull = candidate.totalMembers > 0 && candidate.availableCount === candidate.totalMembers;
              return (
                <button
                  type="button"
                  key={candidate.date}
                  onClick={() => pickCandidate(candidate)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                    date === candidate.date ? "border-brand-500 bg-brand-50" : "border-line bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-ink">{formatDateJp(candidate.date)}</p>
                    {candidate.commonRanges.length > 0 && (
                      <p className="text-xs text-ink-faint">
                        {candidate.commonRanges.map((r) => formatTimeRange(r.start, r.end)).join("、")}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                      isFull ? "bg-mint-500 text-white" : "bg-mint-50 text-mint-700"
                    }`}
                  >
                    {candidate.availableCount}/{candidate.totalMembers}人
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Field label="日付" htmlFor="date">
        <TextInput
          id="date"
          name="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="開始時間" htmlFor="startTime">
          <TextInput
            id="startTime"
            name="startTime"
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </Field>
        <Field label="終了時間" htmlFor="endTime">
          <TextInput
            id="endTime"
            name="endTime"
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </Field>
      </div>

      <Field label="場所" htmlFor="location" optional>
        <TextInput id="location" name="location" placeholder="たとえば「渋谷」" maxLength={100} />
      </Field>

      <Field label="メモ" htmlFor="note" optional>
        <TextArea id="note" name="note" rows={3} maxLength={300} />
      </Field>

      <ErrorText>{state.error}</ErrorText>
      <Button type="submit" disabled={pending}>
        {pending ? "作成中..." : "予定を確定する"}
      </Button>
    </form>
  );
}
