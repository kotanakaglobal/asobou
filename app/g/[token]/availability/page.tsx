import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { listMembers } from "@/lib/db/members";
import { listAvailabilityByGroup, summarizeByDate } from "@/lib/db/availability";
import { formatDateJp, formatTimeRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function AvailabilityPage({ params }: PageProps<"/g/[token]/availability">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const [members, entries] = await Promise.all([
    listMembers(group.id),
    listAvailabilityByGroup(group.id),
  ]);
  const summaries = summarizeByDate(entries, members.length);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="空き時間" backHref={`/g/${token}`} backLabel="グループトップ" />

      {summaries.length === 0 ? (
        <Card className="text-sm text-ink-soft">まだ誰も空き時間を登録していません。</Card>
      ) : (
        <div className="flex flex-col gap-4">
          {summaries.map((summary) => (
            <Card key={summary.date}>
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-ink">{formatDateJp(summary.date)}</p>
                <span className="text-xs font-bold text-ink-faint">
                  {summary.availableCount}/{summary.totalMembers}人
                </span>
              </div>
              <ul className="mt-2 flex flex-col gap-1">
                {summary.entries.map((entry) => (
                  <li key={entry.id} className="flex items-baseline justify-between text-sm text-ink-soft">
                    <span className="font-bold text-ink">{entry.memberName}</span>
                    <span>
                      {formatTimeRange(entry.startTime, entry.endTime)}
                      {entry.note ? `（${entry.note}）` : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 rounded-xl bg-mint-50 px-3 py-2 text-sm font-bold text-mint-700">
                全員の共通空き：
                {summary.commonRanges.length > 0
                  ? summary.commonRanges.map((r) => formatTimeRange(r.start, r.end)).join("、")
                  : "重なる時間はありません"}
              </div>
            </Card>
          ))}
        </div>
      )}

      <LinkButton href={`/g/${token}/availability/new`}>空きを追加</LinkButton>
    </main>
  );
}
