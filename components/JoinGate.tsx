"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useActionState } from "react";
import { loadStoredMember, saveStoredMember, clearStoredMember, type StoredMember } from "@/lib/member-storage";
import { verifyMembershipAction, joinGroupAction } from "@/lib/actions/group";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, ErrorText } from "@/components/ui/Field";

type MemberContextValue = StoredMember & { token: string };

const MemberContext = createContext<MemberContextValue | null>(null);

export function useMember(): MemberContextValue {
  const ctx = useContext(MemberContext);
  if (!ctx) {
    throw new Error("useMember は JoinGate の内側でのみ利用できます");
  }
  return ctx;
}

export function JoinGate({
  token,
  groupName,
  children,
}: {
  token: string;
  groupName: string;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "guest" | "joined">("checking");
  const [member, setMember] = useState<StoredMember | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(async () => {
      const stored = loadStoredMember(token);
      if (!stored) {
        if (!cancelled) setStatus("guest");
        return;
      }
      const ok = await verifyMembershipAction(token, stored.memberId);
      if (cancelled) return;
      if (ok) {
        setMember(stored);
        setStatus("joined");
      } else {
        clearStoredMember(token);
        setStatus("guest");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (status === "checking") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-faint">
        読み込み中...
      </div>
    );
  }

  if (status === "guest") {
    return (
      <JoinForm
        token={token}
        groupName={groupName}
        onJoined={(joined) => {
          const withGroupName = { ...joined, groupName };
          saveStoredMember(token, withGroupName);
          setMember(withGroupName);
          setStatus("joined");
        }}
      />
    );
  }

  return (
    <MemberContext.Provider value={{ ...(member as StoredMember), token }}>
      {children}
    </MemberContext.Provider>
  );
}

function JoinForm({
  token,
  groupName,
  onJoined,
}: {
  token: string;
  groupName: string;
  onJoined: (member: StoredMember) => void;
}) {
  const boundAction = joinGroupAction.bind(null, token);
  const [state, formAction, pending] = useActionState(boundAction, { error: null });

  useEffect(() => {
    if (state.error === null && state.memberId && state.memberName) {
      onJoined({ memberId: state.memberId, memberName: state.memberName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <p className="text-sm font-bold text-brand-600">{groupName}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">グループに参加する</h1>
        <p className="mt-2 text-sm text-ink-soft">あなたの名前だけ入力すれば参加できます</p>
      </div>
      <form action={formAction} className="flex flex-col gap-4">
        <Field label="あなたの名前" htmlFor="memberName">
          <TextInput
            id="memberName"
            name="memberName"
            placeholder="たとえば「たろう」"
            required
            maxLength={40}
            autoFocus
          />
        </Field>
        <ErrorText>{state.error}</ErrorText>
        <Button type="submit" disabled={pending}>
          {pending ? "参加中..." : "参加する"}
        </Button>
      </form>
    </div>
  );
}
