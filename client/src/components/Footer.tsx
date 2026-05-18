import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin, Github } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-20">
      <div className="container px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <Logo size="md" showText={true} />
            <p className="text-base text-muted-foreground leading-relaxed max-w-sm font-medium">
              Ethiopia's premier digital bridge for high-end real estate, premium vehicles, and vetted professional services. Built for the modern success.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Linkedin, href: "#" }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.href} 
                  className="h-10 w-10 rounded-xl border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Marketplace</h3>
            <ul className="space-y-3">
              {[
                { label: "Houses", href: "/house-listings" },
                { label: "Cars", href: "/car-listings" },
                { label: "Services", href: "/service-listings" },
                { label: "Featured Deals", href: "/#listings" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Platform</h3>
            <ul className="space-y-3">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "My Profile", href: "/profile" },
                { label: "Favorites", href: "/favorites" },
                { label: "Settings", href: "/settings" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground">Support</h3>
            <ul className="space-y-3">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Contact Us", href: "/contact" }
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium text-muted-foreground">
            © {new Date().getFullYear()} BrokerConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/80">Systems Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
