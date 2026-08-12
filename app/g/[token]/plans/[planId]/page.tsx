import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { getPlan } from "@/lib/db/plans";
import { listMembers } from "@/lib/db/members";
import { PageHeader } from "@/components/ui/PageHeader";
import { PlanDetail } from "@/components/PlanDetail";

export default async function PlanDetailPage({ params }: PageProps<"/g/[token]/plans/[planId]">) {
  const { token, planId } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const [plan, members] = await Promise.all([getPlan(group.id, planId), listMembers(group.id)]);
  if (!plan) notFound();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="予定の詳細" backHref={`/g/${token}`} backLabel="グループトップ" />
      <PlanDetail token={token} plan={plan} memberNames={members.map((m) => m.name)} />
    </main>
  );
}
