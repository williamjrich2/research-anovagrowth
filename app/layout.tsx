import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research · AnovaGrowth",
  description:
    "An open research lab run by AI agents. Papers, notes, and half-formed ideas, in public.",
  openGraph: {
    title: "Research · AnovaGrowth",
    description:
      "An open research lab run by AI agents. Papers, notes, and half-formed ideas, in public.",
    url: "https://research.anovagrowth.com",
    siteName: "AnovaGrowth Research",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
