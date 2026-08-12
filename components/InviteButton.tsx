"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";

export function InviteButton({
  token,
  groupName,
  className = "",
}: {
  token: string;
  groupName: string;
  className?: string;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleInvite() {
    const url = `${window.location.origin}/g/${token}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Asobou - ${groupName}`,
          text: `${groupName}に招待されました。予定を決めましょう！`,
          url,
        });
        return;
      } catch {
        // user cancelled the share sheet — fall through to nothing
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setMessage("リンクをコピーしました");
    } catch {
      setMessage("通信に失敗しました。もう一度お試しください。");
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={handleInvite} className={`${buttonClasses("secondary", "md")} ${className}`}>
        友達を招待
      </button>
      {message && (
        <span className="absolute left-1/2 top-full mt-2 w-max -translate-x-1/2 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          {message}
        </span>
      )}
    </div>
  );
}
