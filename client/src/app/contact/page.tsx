"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">Get in Touch</h1>
                <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                  Have questions about our platform or need assistance with a listing? Our team is here to help you.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-20">
                {[
                  { icon: Mail, label: "Email", value: "support@brokerconnect.et", color: "text-blue-500 bg-blue-500/10" },
                  { icon: Phone, label: "Phone", value: "+251 911 234 567", color: "text-emerald-500 bg-emerald-500/10" },
                  { icon: MapPin, label: "Office", value: "Bole, Addis Ababa", color: "text-primary bg-primary/10" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center p-8 rounded-3xl border border-border bg-card shadow-soft text-center">
                    <div className={`h-12 w-12 rounded-2xl ${item.color} flex items-center justify-center mb-6`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-base font-bold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-glass">
                <form className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Helina Zeleke"
                        className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
                      <input 
                        type="email" 
                        placeholder="helina@example.com"
                        className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Subject</label>
                    <input 
                      type="text" 
                      placeholder="Inquiry about Property Listing"
                      className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message</label>
                    <textarea 
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    />
                  </div>
                  <Button 
                    type="button"
                    onClick={() => {
                      toast.success("Message sent successfully!");
                    }}
                    className="h-14 px-10 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs gap-3 w-full md:w-auto shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                  >
                    Send Message
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
