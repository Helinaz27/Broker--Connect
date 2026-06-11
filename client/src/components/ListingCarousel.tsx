"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ListingCard from "@/components/ListingCard";
import { cn } from "@/lib/utils";

type ListingCardProps = React.ComponentProps<typeof ListingCard>;

function getVisibleCount(width: number) {
  if (width >= 1280) return 4;
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

interface ListingCarouselProps {
  listings: ListingCardProps[];
  className?: string;
}

export default function ListingCarousel({
  listings,
  className,
}: ListingCarouselProps) {
  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setVisibleCount(getVisibleCount(el.clientWidth));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [listings.length, visibleCount]);

  const maxIndex = Math.max(0, listings.length - visibleCount);
  const activeIndex = Math.min(index, maxIndex);
  const canPrev = activeIndex > 0;
  const canNext = activeIndex < maxIndex;

  const stepPercent = 100 / visibleCount;
  const gapShare = 1.5 / visibleCount;

  if (listings.length === 0) return null;

  return (
    <div className={cn("relative px-10 md:px-12", className)}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background shadow-md disabled:opacity-30"
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={!canPrev}
        aria-label="Previous listings"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <div ref={containerRef} className="overflow-hidden">
        <div
          className="flex gap-6 transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(-${activeIndex} * (${stepPercent}% + ${gapShare}rem)))`,
          }}
        >
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="flex-shrink-0"
              style={{
                width: `calc((100% - ${(visibleCount - 1) * 1.5}rem) / ${visibleCount})`,
              }}
            >
              <ListingCard {...listing} />
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 z-10 h-10 w-10 -translate-y-1/2 rounded-full bg-background shadow-md disabled:opacity-30"
        onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
        disabled={!canNext}
        aria-label="Next listings"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
