"use client";

import ListingPageTemplate from "@/components/ListingPageTemplate";
import { services } from "@/data/listings";

export default function ServiceListings() {
  return (
    <ListingPageTemplate
      title="Services"
      category="service"
      listings={services}
      postLabel="Offer a service"
    />
  );
}
