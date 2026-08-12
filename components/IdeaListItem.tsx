import Link from "next/link";
import type { Idea } from "@/lib/types";

export function IdeaListItem({ token, idea }: { token: string; idea: Idea }) {
  return (
    <Link
      href={`/g/${token}/ideas/${idea.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 transition hover:border-brand-300"
    >
      <div className="min-w-0">
        <p className="truncate font-bold text-ink">{idea.title}</p>
        <p className="text-xs text-ink-faint">{idea.memberName}が追加</p>
      </div>
      <span className="shrink-0 rounded-full bg-mint-50 px-3 py-1 text-xs font-bold text-mint-700">
        {idea.voteCount}人がやりたい
      </span>
    </Link>
  );
}
