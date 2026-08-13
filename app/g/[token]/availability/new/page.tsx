import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { AddAvailabilityForm } from "@/components/AddAvailabilityForm";

export default async function NewAvailabilityPage({ params }: PageProps<"/g/[token]/availability/new">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-6 px-4 py-6">
      <PageHeader title="空いてる日を登録" backHref={`/g/${token}/availability`} />
      <AddAvailabilityForm token={token} />
    </main>
  );
}
