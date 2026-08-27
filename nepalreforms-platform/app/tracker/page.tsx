import type { Metadata } from "next"
import TrackerComingSoonClient from "./tracker-coming-soon-client"

export const metadata: Metadata = {
  title: "Tracker (Coming Soon) | Nepal Reforms Intelligence Backbone",
  description:
    "Explore the upcoming NepalReforms Tracker — the public accountability intelligence system connecting manifesto promises, Red Book budget movements, and ground-reality verification for Nepal.",
  keywords: [
    "Nepal Reforms Tracker",
    "Nepal budget tracker",
    "Nepal promise tracker",
    "Nepal governance intelligence",
    "Red Book budget tracking",
    "Nepal parliamentary accountability",
  ],
  openGraph: {
    title: "NepalReforms Tracker — Coming Soon",
    description:
      "The public accountability intelligence system connecting manifesto promises, Red Book budget movements, and ground-reality verification for Nepal.",
    url: "https://nepalreforms.com/tracker",
    type: "website",
  },
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function TrackerPage() {
  return <TrackerComingSoonClient />
}
