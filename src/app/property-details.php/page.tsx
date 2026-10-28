import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PROPERTIES } from '@/data/properties';
import PropertyDetailClient from '../properties/[id]/PropertyDetailClient';

interface Props {
  searchParams: Promise<{ pid?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { pid: rawPid } = await searchParams;
  const pid = parseInt(rawPid || '1', 10);
  const prop = PROPERTIES.find((p) => p.id === pid) || PROPERTIES[0];

  return {
    title: `${prop.title} | Baltimore Harbor Properties`,
    description: prop.description,
    openGraph: {
      title: `${prop.title} — Baltimore Harbor Properties`,
      description: prop.description,
      images: [{ url: prop.coverImage }],
    },
  };
}

export default async function PropertyDetailsLegacyPage({ searchParams }: Props) {
  const { pid: rawPid } = await searchParams;
  const pid = parseInt(rawPid || '1', 10);
  const property = PROPERTIES.find((p) => p.id === pid);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} propertyId={pid} />;
}
