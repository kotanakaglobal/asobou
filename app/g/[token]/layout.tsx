import { notFound } from "next/navigation";
import { getGroupByToken } from "@/lib/db/groups";
import { JoinGate } from "@/components/JoinGate";

export default async function GroupLayout({ children, params }: LayoutProps<"/g/[token]">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  return (
    <JoinGate token={token} groupName={group.name}>
      {children}
    </JoinGate>
  );
}
