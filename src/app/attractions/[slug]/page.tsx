import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ATTRACTIONS, getAttractionBySlug } from '@/data/attractions';
import { PROPERTIES } from '@/data/properties';
import AttractionDetailClient from './AttractionDetailClient';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return ATTRACTIONS.map((attraction) => ({
    slug: attraction.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const attraction = getAttractionBySlug(params.slug);
  if (!attraction) {
    return { title: 'Attraction Not Found | Baltimore Harbor Properties' };
  }

  return {
    title: `${attraction.title} — Visitor Guide & Nearby Furnished Residences | Baltimore Harbor Properties`,
    description: `${attraction.summary} Stay in luxury Baltimore Harbor Properties residences located just minutes from ${attraction.title}.`,
    openGraph: {
      title: `${attraction.title} | Baltimore Harbor Properties Baltimore`,
      description: attraction.summary,
      images: [{ url: attraction.heroImage }],
    },
  };
}

export default function AttractionPage({ params }: Props) {
  const attraction = getAttractionBySlug(params.slug);
  if (!attraction) {
    notFound();
  }

  // Filter nearby properties for direct booking
  const nearbyProperties = PROPERTIES.filter((p) =>
    attraction.nearbyPropertyIds.includes(p.id)
  );

  // Other attractions for the navigation section
  const otherAttractions = ATTRACTIONS.filter((a) => a.slug !== attraction.slug);

  return (
    <AttractionDetailClient
      attraction={attraction}
      nearbyProperties={nearbyProperties}
      otherAttractions={otherAttractions}
    />
  );
}
