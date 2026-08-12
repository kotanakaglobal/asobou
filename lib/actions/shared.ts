import { ValidationError } from "@/lib/validation";

export type ActionState = { error: string | null };

export const NETWORK_ERROR_MESSAGE = "通信に失敗しました。もう一度お試しください。";

/** Maps a caught error to a user-facing message: validation errors pass
 * through as-is, anything else (DB/network failures) becomes a generic
 * retry message so internal details never leak to the client. */
export function toErrorMessage(err: unknown): string {
  if (err instanceof ValidationError) return err.message;
  console.error(err);
  return NETWORK_ERROR_MESSAGE;
}
