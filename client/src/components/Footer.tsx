import Link from "next/link";
import { Twitter, Facebook, Instagram } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-16">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Logo size="sm" showText={true} className="[&_span]:text-lg" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">
              Professional marketplace for properties, vehicles, and services in Ethiopia.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Marketplace</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/house-listings" className="hover:text-foreground transition-colors">Properties</Link></li>
              <li><Link href="/car-listings" className="hover:text-foreground transition-colors">Vehicles</Link></li>
              <li><Link href="/service-listings" className="hover:text-foreground transition-colors">Services</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-foreground transition-colors">Help</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Connect</h3>
            <div className="flex gap-2">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors" aria-label={`Social link ${i + 1}`}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Digital Broker. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
