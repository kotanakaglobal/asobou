import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddIdeaForm } from "@/components/AddIdeaForm";

export default async function NewIdeaPage({ params }: PageProps<"/g/[token]/ideas/new">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="やりたいことを追加" backHref={`/g/${token}/ideas`} />
      <AddIdeaForm token={token} />
    </main>
  );
}
