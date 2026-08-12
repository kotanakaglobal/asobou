import "server-only";
import { randomBytes } from "node:crypto";

// URL-safe, cryptographically random share token, e.g. "7Kx92pLmQa3f".
// 9 random bytes -> 12 base64url characters (~72 bits of entropy), which is
// treated as the group's secret invite credential (see security notes in
// README.md).
export function generateShareToken(): string {
  return randomBytes(9).toString("base64url");
}
