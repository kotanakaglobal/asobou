import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { getIdeaWithVotes } from "@/lib/db/ideas";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { VoteButton } from "@/components/VoteButton";

export default async function IdeaDetailPage({ params }: PageProps<"/g/[token]/ideas/[ideaId]">) {
  const { token, ideaId } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const idea = await getIdeaWithVotes(group.id, ideaId);
  if (!idea) notFound();

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="やりたいこと" backHref={`/g/${token}/ideas`} />

      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-ink">{idea.title}</h2>
          <p className="mt-1 text-sm text-ink-faint">{idea.memberName}が追加</p>
        </div>

        {idea.note && <p className="whitespace-pre-wrap text-sm text-ink">{idea.note}</p>}

        <div>
          <p className="text-sm font-bold text-ink-soft">
            {idea.voteCount}人がやりたい
          </p>
          {idea.voterNames.length > 0 && (
            <p className="mt-1 text-sm text-ink-faint">{idea.voterNames.join("、")}</p>
          )}
        </div>
      </Card>

      <VoteButton
        token={token}
        groupId={group.id}
        ideaId={idea.id}
        voterIds={idea.voterIds}
        voteCount={idea.voteCount}
      />

      <LinkButton href={`/g/${token}/plans/new?ideaId=${idea.id}`} variant="secondary">
        この予定を作る
      </LinkButton>
    </main>
  );
}
