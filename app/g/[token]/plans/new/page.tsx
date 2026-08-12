import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { listMembers } from "@/lib/db/members";
import { listAvailabilityByGroup, summarizeByDate } from "@/lib/db/availability";
import { getIdeaWithVotes } from "@/lib/db/ideas";
import { rankDateCandidates } from "@/lib/candidates";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreatePlanForm } from "@/components/CreatePlanForm";

export default async function NewPlanPage({
  params,
  searchParams,
}: PageProps<"/g/[token]/plans/new">) {
  const { token } = await params;
  const { ideaId } = await searchParams;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const rawIdeaId = Array.isArray(ideaId) ? ideaId[0] : ideaId;

  const [members, availabilityEntries, idea] = await Promise.all([
    listMembers(group.id),
    listAvailabilityByGroup(group.id),
    rawIdeaId ? getIdeaWithVotes(group.id, rawIdeaId) : Promise.resolve(null),
  ]);

  const dateSummaries = summarizeByDate(availabilityEntries, members.length);
  const dateCandidates = rankDateCandidates(dateSummaries).slice(0, 6);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader
        title="予定を作る"
        backHref={idea ? `/g/${token}/ideas/${idea.id}` : `/g/${token}`}
      />
      <CreatePlanForm
        token={token}
        ideaId={idea?.id ?? null}
        ideaTitle={idea?.title ?? null}
        dateCandidates={dateCandidates}
        memberNames={members.map((m) => m.name)}
      />
    </main>
  );
}
