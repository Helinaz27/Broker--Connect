import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | Digital Broker",
  description: "Get help using Digital Broker. Find answers about listing and finding properties, vehicles, and services in Ethiopia.",
};

export default function HelpLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
