"use client";

import { useParams, useRouter } from "next/navigation";
import Chat from "@/components/Chat";
import { Button } from "@/components/ui/button";
import { getServiceById } from "@/data/listings";
import { MapPin, ArrowLeft, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const service = id ? getServiceById(id) : null;
  const [activeImage, setActiveImage] = useState(0);

  if (!service) {
    return (
      <main className="flex-1 container px-4 py-16 text-center">
        <p className="text-muted-foreground mb-4">Service not found.</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </main>
    );
  }

  const gallery = service.images || [service.image];

  return (
    <main className="flex-1 py-8 md:py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link href="/service-listings" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to services
        </Link>
        
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          {/* Image Gallery */}
          <div className="space-y-6">
            <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl relative group aspect-[16/10]">
              <img 
                src={gallery[activeImage]} 
                alt={service.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              
              <div className="absolute top-6 left-6 flex gap-3">
                <span className="bg-background/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 shadow-xl">
                  Service
                </span>
              </div>

              {gallery.length > 1 && (
                <>
                  <button 
                    onClick={() => setActiveImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={() => setActiveImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-24 w-32 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="space-y-8">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight italic leading-tight mb-4">
                {service.title}
              </h1>

              <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm mb-8">
                <MapPin className="h-4 w-4 text-primary" />
                {service.location}
              </div>

              <div className="p-6 bg-muted/30 border border-border/40 rounded-3xl mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  Service Rate
                </p>
                <p className="text-4xl font-black text-primary tracking-tighter">
                  {service.price.toLocaleString()}
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">ETB</span>
                </p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">Per Project / Session</p>
              </div>

              <div className="space-y-6 mb-10">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Expertise Description</h3>
                <p className="text-muted-foreground leading-relaxed font-medium text-sm">
                  {service.description || "No description provided for this service."}
                </p>
              </div>

              <Button asChild className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all group">
                <a href={`mailto:contact@brokerconnect.et?subject=Service Inquiry: ${encodeURIComponent(service.title)}`}>
                  Initiate Connection
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Chat />
    </main>
  );
}
