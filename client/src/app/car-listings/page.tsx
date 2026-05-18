"use client";

import ListingPageTemplate from "@/components/ListingPageTemplate";
import { cars } from "@/data/listings";

export default function CarListings() {
  return (
    <ListingPageTemplate
      title="Cars"
      category="car"
      listings={cars}
      postLabel="Post a car"
    />
  );
}
