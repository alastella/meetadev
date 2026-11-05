import "server-only";
import { query } from "./db";

export type AttendeeCheck = { onboarded: boolean; joinedEvent: boolean | null };

/**
 * What a partner app may learn about a username someone pasted into it: whether it belongs to a finished meetadev
 * profile and, when an event is given, whether that person has joined it. Nothing else.
 * Suspended accounts count as not onboarded. Returns null when the event slug doesn't exist.
 */
export async function checkAttendee(handle: string, eventSlug: string | null): Promise<AttendeeCheck | null> {
  let eventId: string | null = null;
  if (eventSlug) {
    const ev = await query<{ id: string }>("SELECT id FROM events WHERE slug = $1", [eventSlug]);
    if (!ev[0]) return null;
    eventId = ev[0].id;
  }
  const rows = await query<{ onboarded: boolean; joined: boolean }>(
    `SELECT p.onboarded,
            ($2::uuid IS NOT NULL AND EXISTS (SELECT 1 FROM event_members m WHERE m.user_id = p.user_id AND m.event_id = $2::uuid)) AS joined
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE p.handle = $1 AND u.suspended_at IS NULL`,
    [handle, eventId],
  );
  const onboarded = rows[0]?.onboarded ?? false;
  return { onboarded, joinedEvent: eventId ? onboarded && (rows[0]?.joined ?? false) : null };
}
