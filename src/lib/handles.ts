// Usernames: the <handle> in meetadev.xyz/p/<handle>, shown as @handle. People choose their own on Edit badge, and
// partner apps (Faaji) ask people to paste theirs. Pure, so tests can import it.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;
/** Lowercase letters, numbers and hyphens, starting and ending with a letter or number (generated ones look like ada-3f2a). */
export const HANDLE_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export function handleProblem(handle: string): string | null {
  if (handle.length < HANDLE_MIN) return `Your username needs at least ${HANDLE_MIN} characters.`;
  if (handle.length > HANDLE_MAX) return `Your username can be up to ${HANDLE_MAX} characters.`;
  if (!HANDLE_RE.test(handle)) return "Use lowercase letters, numbers and hyphens only, e.g. ada-lovelace.";
  return null;
}

/** What someone pasted ("@Ada", "meetadev.xyz/p/ada", " ada ") as a bare lowercase handle. */
export function cleanHandle(input: string) {
  return input
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?meetadev\.xyz\/p\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "")
    .toLowerCase();
}
