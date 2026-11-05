import { NextResponse, type NextRequest } from "next/server";

const EVENT_COOKIE = "dfi_event";

// Fast gate for signed-in screens (pages still verify the session in the
// database), and remembers the last event visited so "People" opens it.
// The homepage is the same for everyone, people and search engines alike: its buttons ask "attending or organising?".
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const eventPath = pathname.match(/^\/e\/([a-z0-9-]+)(\/.*)?$/);
  // The event page itself, and its share image (link previews and search engines fetch it without a session).
  const publicEventPage = eventPath && (!eventPath[2] || eventPath[2].startsWith("/opengraph-image"));

  if (!publicEventPage && !request.cookies.has("dfi_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  // Page loads only: a cookie set on a server action's POST makes Next re-render the page, which resets the deck.
  if (eventPath && request.method === "GET")
    response.cookies.set(EVENT_COOKIE, eventPath[1], { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  return response;
}

export const config = {
  matcher: [
    "/people/:path*", "/p/:path*", "/requests/:path*", "/connections/:path*", "/me/:path*",
    // Not /discover: anyone can search Find events (D-013).
    "/onboarding/:path*", "/welcome/:path*", "/events/:path*", "/e/:path*", "/admin/:path*", "/leaderboard", "/chat/:path*",
  ],
};
