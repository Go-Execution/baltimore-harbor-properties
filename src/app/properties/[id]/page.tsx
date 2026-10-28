import React from 'react';
import { Metadata } from 'next';
import { PROPERTIES } from '@/data/properties';
import PropertyDetailClient from './PropertyDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return PROPERTIES.map((prop) => ({
    id: prop.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prop = PROPERTIES.find((p) => p.id === parseInt(id, 10));
  if (!prop) {
    return { title: 'Residence Not Found' };
  }

  return {
    title: `${prop.title} — ${prop.neighborhood}`,
    description: `${prop.title} in ${prop.neighborhood}, Baltimore. ${prop.subtitle}`,
    openGraph: {
      title: `${prop.title} — Baltimore Harbor Properties`,
      description: prop.description,
      images: [{ url: prop.coverImage }],
    },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const pid = parseInt(id, 10);
  const property = PROPERTIES.find((p) => p.id === pid) || PROPERTIES[0];

  return <PropertyDetailClient property={property} propertyId={pid} />;
}
