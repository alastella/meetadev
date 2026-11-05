// Partner apps (event apps such as Faaji) call meetadev's server-to-server API with a secret key.
// PARTNER_KEYS holds them as comma-separated name:key pairs, e.g. "faaji:2f9c…,other:8a1b…".
// Pure (no database, no Next), so tests can import it.
import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** name -> sha256(key). Pairs without a name or a key of at least 32 characters are ignored. */
export function parsePartnerKeys(raw: string | undefined) {
  const keys = new Map<string, Buffer>();
  for (const pair of (raw ?? "").split(",")) {
    const at = pair.indexOf(":");
    const name = pair.slice(0, at).trim().toLowerCase();
    const key = pair.slice(at + 1).trim();
    if (at > 0 && /^[a-z0-9-]+$/.test(name) && key.length >= 32) keys.set(name, digest(key));
  }
  return keys;
}

/** The partner a "Bearer <key>" header belongs to, or null. Compares digests in constant time. */
export function partnerFor(authorization: string | null, keys: Map<string, Buffer>) {
  const m = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!m) return null;
  const given = digest(m[1]);
  let found: string | null = null;
  for (const [name, want] of keys) if (timingSafeEqual(given, want)) found = name;
  return found;
}
