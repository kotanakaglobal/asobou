import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { listMembers } from "@/lib/db/members";
import { PageHeader } from "@/components/ui/PageHeader";
import { MemberRow } from "@/components/MemberRow";

export default async function MembersPage({ params }: PageProps<"/g/[token]/members">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const members = await listMembers(group.id);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title={`メンバー（${members.length}人）`} backHref={`/g/${token}`} backLabel="グループトップ" />

      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <MemberRow key={m.id} token={token} target={m} />
        ))}
      </div>
    </main>
  );
}
