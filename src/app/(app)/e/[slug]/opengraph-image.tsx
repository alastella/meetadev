import { ImageResponse } from "next/og";
import { markSvg } from "@/lib/brand";
import { query } from "@/lib/db";
import { eventBySlug } from "@/lib/events";
import { formatDate } from "@/lib/format";

export const alt = "An event on meetadev: see who's going and meet the people you came to meet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card shown when an event link is shared on WhatsApp, X or LinkedIn: the event's own name, date, city and host.
export default async function EventImage({ params }: { params: Promise<{ slug: string }> }) {
  const event = await eventBySlug((await params).slug);
  const host = event?.community_id
    ? (await query<{ name: string }>("SELECT name FROM communities WHERE id = $1 AND status = 'active'", [event.community_id]))[0]?.name
    : undefined;
  const name = event?.name ?? "An event on meetadev";
  const meta = event ? [event.city, formatDate(event.starts_on)].filter(Boolean).join(" · ") : "";
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(markSvg(84))}`;
  const band = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <div style={{ display: "flex", height: 18 }}>
          {band.map((c) => <div key={c} style={{ flex: 1, background: c }} />)}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "0 88px" }}>
          {meta && <div style={{ fontSize: 34, color: "#5f6368", letterSpacing: 4, textTransform: "uppercase" }}>{meta}</div>}
          <div style={{ fontSize: name.length > 28 ? 84 : 112, fontWeight: 700, letterSpacing: -4, color: "#202124", lineHeight: 1 }}>{name}</div>
          {host && <div style={{ fontSize: 38, color: "#1a73e8" }}>{`Hosted by ${host}`}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "0 88px 48px" }}>
          <img src={src} width={84} height={84} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1.5, color: "#202124" }}>meetadev</div>
            <div style={{ fontSize: 28, color: "#5f6368" }}>See who&apos;s going. Meet the people you came to meet.</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
