"use client";

import { useState, useTransition } from "react";
import { useMember } from "@/components/JoinGate";
import { markAvailableAction, deleteAvailabilityAction } from "@/lib/actions/availability";
import { Button } from "@/components/ui/Button";
import type { Availability } from "@/lib/types";

export function MarkAvailableToggle({
  token,
  groupId,
  date,
  entries,
}: {
  token: string;
  groupId: string;
  date: string;
  entries: Availability[];
}) {
  const member = useMember();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const mine = entries.find((e) => e.memberId === member.memberId);

  function toggle() {
    startTransition(async () => {
      const result = mine
        ? await deleteAvailabilityAction(token, mine.id, member.memberId)
        : await markAvailableAction(token, groupId, date, member.memberId);
      setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant={mine ? "secondary" : "ghost"}
        size="md"
        onClick={toggle}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "更新中..." : mine ? "✓ 空いてます（取り消す）" : "私も空いてます"}
      </Button>
      {error && <p className="text-xs font-bold text-danger">{error}</p>}
    </div>
  );
}
