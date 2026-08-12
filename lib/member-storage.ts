// Client-only localStorage helpers. There is no login system: the browser
// remembers "who I am in this group" locally, per group. See README for the
// trust model this implies (member ids are not cryptographically verified).

export type StoredMember = { memberId: string; memberName: string; groupName?: string };
export type StoredGroupEntry = StoredMember & { token: string };

const KEY_PREFIX = "asobou_group_";

function storageKey(token: string): string {
  return `${KEY_PREFIX}${token}`;
}

export function loadStoredMember(token: string): StoredMember | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredMember>;
    if (typeof parsed.memberId === "string" && typeof parsed.memberName === "string") {
      return {
        memberId: parsed.memberId,
        memberName: parsed.memberName,
        groupName: typeof parsed.groupName === "string" ? parsed.groupName : undefined,
      };
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

/** Every group this browser has previously joined or created, for a "jump
 * back into an existing group" shortcut. Entries saved before groupName was
 * tracked fall back to a generic label rather than being hidden. */
export function listStoredGroups(): StoredGroupEntry[] {
  if (typeof window === "undefined") return [];

  const entries: StoredGroupEntry[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(KEY_PREFIX)) continue;
    const token = key.slice(KEY_PREFIX.length);
    const stored = loadStoredMember(token);
    if (stored) entries.push({ ...stored, token });
  }
  return entries;
}
