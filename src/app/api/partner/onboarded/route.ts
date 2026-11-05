import { cleanHandle, handleProblem } from "@/lib/handles";
import { parsePartnerKeys, partnerFor } from "@/lib/partner-keys";
import { checkAttendee } from "@/lib/partners";
import { allow } from "@/lib/ratelimit";

// Server-to-server: a partner event app (Faaji) has a quest "Join this event on meetadev". The attendee pastes their
// meetadev username, and the partner's server asks whether it's a finished profile that has joined the event.
// See docs/partner-api.md.
const NO_STORE = { "Cache-Control": "no-store" };
const fail = (status: number, error: string) => Response.json({ error }, { status, headers: NO_STORE });
const SLUG = /^[a-z0-9-]{1,80}$/;

export async function POST(request: Request) {
  const keys = parsePartnerKeys(process.env.PARTNER_KEYS);
  if (!keys.size) return fail(503, "Partner checks are not set up.");
  const partner = partnerFor(request.headers.get("authorization"), keys);
  if (!partner) return fail(401, "Missing or wrong API key.");

  let body: { username?: unknown; event?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, "Send a JSON body: { \"username\": \"…\", \"event\": \"event-slug\" }.");
  }
  const username = typeof body.username === "string" ? cleanHandle(body.username) : "";
  const event = typeof body.event === "string" && body.event.trim() ? body.event.trim().toLowerCase() : null;
  if (event !== null && !SLUG.test(event)) return fail(400, "event must be a meetadev event slug, as in meetadev.xyz/e/<slug>.");
  if (!(await allow(`partner:${partner}`, 600, 60))) return fail(429, "Too many checks. Try again in a minute.");

  // Not a username at all (empty, spaces, too long): the same answer as one nobody has.
  if (handleProblem(username)) return Response.json({ username, onboarded: false, joinedEvent: event ? false : null }, { headers: NO_STORE });
  const result = await checkAttendee(username, event);
  if (!result) return fail(404, "No meetadev event with that slug.");
  return Response.json({ username, ...result }, { headers: NO_STORE });
}
