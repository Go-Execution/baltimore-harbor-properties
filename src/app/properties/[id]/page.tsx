import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PROPERTIES } from '@/data/properties';
import PropertyDetailClient from './PropertyDetailClient';

interface Props {
  params: { id: string };
}

export async function generateStaticParams() {
  return PROPERTIES.map((prop) => ({
    id: prop.id.toString(),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prop = PROPERTIES.find((p) => p.id === parseInt(params.id, 10));
  if (!prop) {
    return { title: 'Residence Not Found' };
  }

  return {
    title: `${prop.title} — ${prop.neighborhood}`,
    description: `${prop.title} in ${prop.neighborhood}, Baltimore. ${prop.subtitle}`,
    openGraph: {
      title: `${prop.title} — Chase Street Properties`,
      description: prop.description,
      images: [{ url: prop.coverImage }],
    },
  };
}

export default function PropertyPage({ params }: Props) {
  const pid = parseInt(params.id, 10);
  const property = PROPERTIES.find((p) => p.id === pid);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
