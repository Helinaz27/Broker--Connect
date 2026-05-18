"use client";

import ListingPageTemplate from "@/components/ListingPageTemplate";
import { houses } from "@/data/listings";

export default function HouseListings() {
  return (
    <ListingPageTemplate
      title="Houses"
      category="house"
      listings={houses}
      postLabel="Post a house"
    />
  );
}
