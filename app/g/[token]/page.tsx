import { notFound } from "next/navigation";
import Link from "next/link";
import { getGroupByToken } from "@/lib/db/groups";
import { listMembers } from "@/lib/db/members";
import { listAvailabilityByGroup, summarizeByDate } from "@/lib/db/availability";
import { listIdeasByGroup } from "@/lib/db/ideas";
import { listPlansByGroup } from "@/lib/db/plans";
import { rankDateCandidates, rankIdeas, getTopCandidate } from "@/lib/candidates";
import { formatDateJp, formatTimeRange } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { InviteButton } from "@/components/InviteButton";
import { IdeaListItem } from "@/components/IdeaListItem";

export default async function GroupTopPage({ params }: PageProps<"/g/[token]">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const [members, availabilityEntries, ideas, plans] = await Promise.all([
    listMembers(group.id),
    listAvailabilityByGroup(group.id),
    listIdeasByGroup(group.id),
    listPlansByGroup(group.id),
  ]);

  const dateSummaries = summarizeByDate(availabilityEntries, members.length);
  const upcomingDates = rankDateCandidates(dateSummaries).slice(0, 3);
  const topIdeas = rankIdeas(ideas).slice(0, 4);
  const topCandidate = getTopCandidate(dateSummaries, ideas);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{group.name}</h1>
          <p className="mt-0.5 text-sm text-ink-soft">{members.length}人が参加中</p>
        </div>
        <InviteButton token={token} groupName={group.name} />
      </header>

      <section aria-label="次の予定候補">
        <Card className="border-brand-200 bg-brand-50">
          <p className="text-xs font-bold text-brand-600">次の予定候補</p>
          {topCandidate && (topCandidate.date || topCandidate.idea) ? (
            <div className="mt-2 flex flex-col gap-1">
              {topCandidate.date && (
                <p className="text-lg font-extrabold text-ink">
                  {formatDateJp(topCandidate.date)}
                  <span className="ml-2 text-sm font-bold text-brand-600">
                    {topCandidate.availableCount}/{topCandidate.totalMembers}人空き
                  </span>
                </p>
              )}
              {topCandidate.idea && (
                <p className="text-base font-bold text-ink">
                  {topCandidate.idea.title}
                  <span className="ml-2 text-sm font-bold text-mint-700">
                    {topCandidate.idea.voteCount}人がやりたい
                  </span>
                </p>
              )}
              {topCandidate.idea && (
                <Link
                  href={`/g/${token}/ideas/${topCandidate.idea.id}`}
                  className="mt-1 w-fit text-sm font-bold text-brand-600 hover:underline"
                >
                  この予定を作る →
                </Link>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">
              空き時間とやりたいことを登録すると、候補が表示されます。
            </p>
          )}
        </Card>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <LinkButton href={`/g/${token}/availability/new`} variant="primary" size="md" className="w-full">
          空きを登録
        </LinkButton>
        <LinkButton href={`/g/${token}/ideas/new`} variant="secondary" size="md" className="w-full">
          やりたいことを追加
        </LinkButton>
      </section>

      <section aria-label="共通の空き時間" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-ink-soft">共通の空き時間</h2>
          <Link href={`/g/${token}/availability`} className="text-xs font-bold text-brand-600 hover:underline">
            すべて見る
          </Link>
        </div>
        {upcomingDates.length === 0 ? (
          <Card className="text-sm text-ink-soft">まだ空き時間が登録されていません。</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingDates.map((summary) => (
              <Card key={summary.date} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-ink">{formatDateJp(summary.date)}</p>
                  <p className="text-xs text-ink-faint">
                    {summary.availableCount}/{summary.totalMembers}人空き
                  </p>
                </div>
                <p className="text-sm font-bold text-mint-700">
                  {summary.commonRanges.length > 0
                    ? summary.commonRanges.map((r) => formatTimeRange(r.start, r.end)).join("、")
                    : "重なる時間なし"}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-label="人気のやりたいこと" className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-ink-soft">人気のやりたいこと</h2>
          <Link href={`/g/${token}/ideas`} className="text-xs font-bold text-brand-600 hover:underline">
            すべて見る
          </Link>
        </div>
        {topIdeas.length === 0 ? (
          <Card className="text-sm text-ink-soft">まだやりたいことが登録されていません。</Card>
        ) : (
          <div className="flex flex-col gap-2">
            {topIdeas.map((idea) => (
              <IdeaListItem key={idea.id} token={token} idea={idea} />
            ))}
          </div>
        )}
      </section>

      {plans.length > 0 && (
        <section aria-label="確定した予定" className="flex flex-col gap-2">
          <h2 className="text-sm font-extrabold text-ink-soft">確定した予定</h2>
          <div className="flex flex-col gap-2">
            {plans.map((plan) => (
              <Link key={plan.id} href={`/g/${token}/plans/${plan.id}`}>
                <Card className="flex items-center justify-between gap-3 hover:border-brand-300">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{plan.ideaTitle ?? "予定"}</p>
                    <p className="text-xs text-ink-faint">
                      {formatDateJp(plan.date)} {formatTimeRange(plan.startTime, plan.endTime)}
                    </p>
                  </div>
                  {plan.location && (
                    <span className="shrink-0 text-xs font-bold text-ink-faint">{plan.location}</span>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
