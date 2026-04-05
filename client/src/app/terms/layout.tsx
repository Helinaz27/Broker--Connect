import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Digital Broker",
  description: "Terms of Service for the Digital Broker marketplace. Rules for listing and using properties, vehicles, and services in Ethiopia.",
};

export default function TermsLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
