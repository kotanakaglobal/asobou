"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listStoredGroups, type StoredGroupEntry } from "@/lib/member-storage";

export function MyGroupsList() {
  const [groups, setGroups] = useState<StoredGroupEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setGroups(listStoredGroups());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (groups.length === 0) return null;

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-xs font-bold text-ink-soft">参加中のグループ</p>
      <div className="flex flex-col gap-2">
        {groups.map((g) => (
          <Link
            key={g.token}
            href={`/g/${g.token}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left transition hover:border-brand-300"
          >
            <span className="truncate font-bold text-ink">{g.groupName ?? "グループを開く"}</span>
            <span className="shrink-0 text-xs text-ink-faint">{g.memberName}として参加 →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
