"use client";

import { useOptimistic, useTransition } from "react";
import { useMember } from "@/components/JoinGate";
import { voteIdeaAction, unvoteIdeaAction } from "@/lib/actions/ideas";
import { Button } from "@/components/ui/Button";

type VoteState = { voted: boolean; count: number };

export function VoteButton({
  token,
  groupId,
  ideaId,
  voterIds,
  voteCount,
  size = "lg",
}: {
  token: string;
  groupId: string;
  ideaId: string;
  voterIds: string[];
  voteCount: number;
  size?: "md" | "lg";
}) {
  const member = useMember();
  const initiallyVoted = voterIds.includes(member.memberId);
  const [isPending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic<VoteState, boolean>(
    { voted: initiallyVoted, count: voteCount },
    (state, voted) => ({ voted, count: state.count + (voted ? 1 : -1) })
  );

  function toggle() {
    const nextVoted = !optimistic.voted;
    startTransition(async () => {
      setOptimistic(nextVoted);
      if (nextVoted) {
        await voteIdeaAction(token, groupId, ideaId, member.memberId);
      } else {
        await unvoteIdeaAction(token, groupId, ideaId, member.memberId);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={optimistic.voted ? "secondary" : "primary"}
      size={size}
      onClick={toggle}
      disabled={isPending}
    >
      {optimistic.voted ? `投票を取り消す (${optimistic.count})` : `これやりたい (${optimistic.count})`}
    </Button>
  );
}
