import { CreateGroupForm } from "@/components/CreateGroupForm";
import { MyGroupsList } from "@/components/MyGroupsList";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CreateGroupPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-8 px-4 py-10">
      <PageHeader title="グループを作る" backHref="/" backLabel="トップに戻る" />
      <MyGroupsList />
      <div className="flex flex-col gap-5">
        <p className="text-xs font-bold text-ink-soft">新しいグループを作る</p>
        <CreateGroupForm />
      </div>
    </main>
  );
}
