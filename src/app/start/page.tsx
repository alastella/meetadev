import type { Metadata } from "next";
import { GetStarted } from "@/components/GetStarted";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// The swipeable intro. No longer shown in place of the homepage (that showed people something different from search
// engines); kept for direct links.
export default function StartPage() {
  return <GetStarted />;
}
