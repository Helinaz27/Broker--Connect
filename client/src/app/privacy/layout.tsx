import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Digital Broker",
  description: "Digital Broker privacy policy. How we collect, use, and protect your data on our marketplace for properties, vehicles, and services in Ethiopia.",
};

export default function PrivacyLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
