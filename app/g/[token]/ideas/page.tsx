import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { listIdeasByGroup } from "@/lib/db/ideas";
import { rankIdeas } from "@/lib/candidates";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { IdeaListItem } from "@/components/IdeaListItem";

export default async function IdeasPage({ params }: PageProps<"/g/[token]/ideas">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const ideas = rankIdeas(await listIdeasByGroup(group.id));

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="やりたいこと" backHref={`/g/${token}`} backLabel="グループトップ" />

      {ideas.length === 0 ? (
        <Card className="text-sm text-ink-soft">まだやりたいことが登録されていません。</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {ideas.map((idea) => (
            <IdeaListItem key={idea.id} token={token} idea={idea} />
          ))}
        </div>
      )}

      <LinkButton href={`/g/${token}/ideas/new`}>やりたいことを追加</LinkButton>
    </main>
  );
}
