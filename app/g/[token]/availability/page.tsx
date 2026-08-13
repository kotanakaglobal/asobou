import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { listMembers } from "@/lib/db/members";
import { listAvailabilityByGroup, summarizeByDate } from "@/lib/db/availability";
import { formatDateJp } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { AvailabilityEntryRow } from "@/components/AvailabilityEntryRow";
import { MarkAvailableToggle } from "@/components/MarkAvailableToggle";

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
      <PageHeader title="空いてる日" backHref={`/g/${token}`} backLabel="グループトップ" />

      {summaries.length === 0 ? (
        <Card className="text-sm text-ink-soft">まだ誰も空いてる日を登録していません。</Card>
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
              <ul className="mt-2 flex flex-col gap-2">
                {summary.entries.map((entry) => (
                  <AvailabilityEntryRow key={entry.id} token={token} entry={entry} />
                ))}
              </ul>
              <div className="mt-3">
                <MarkAvailableToggle token={token} groupId={group.id} date={summary.date} entries={summary.entries} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <LinkButton href={`/g/${token}/availability/new`}>空いてる日を追加</LinkButton>
    </main>
  );
}
