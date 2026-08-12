// Client-only localStorage helpers. There is no login system: the browser
// remembers "who I am in this group" locally, per group. See README for the
// trust model this implies (member ids are not cryptographically verified).

export type StoredMember = { memberId: string; memberName: string };

function storageKey(token: string): string {
  return `asobou_group_${token}`;
}

export function loadStoredMember(token: string): StoredMember | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredMember>;
    if (typeof parsed.memberId === "string" && typeof parsed.memberName === "string") {
      return { memberId: parsed.memberId, memberName: parsed.memberName };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredMember(token: string, member: StoredMember): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(token), JSON.stringify(member));
}

export function clearStoredMember(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(token));
}
