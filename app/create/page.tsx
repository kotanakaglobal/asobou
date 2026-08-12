import { CreateGroupForm } from "@/components/CreateGroupForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CreateGroupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-4 py-10">
      <PageHeader title="グループを作る" backHref="/" backLabel="トップに戻る" />
      <CreateGroupForm />
    </main>
  );
}
