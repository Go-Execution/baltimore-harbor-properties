import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const viewport: Viewport = {
  themeColor: '#17231f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://baltimore-harbor-properties.vercel.app'),
  title: {
    default: 'Baltimore Harbor Properties — Furnished Executive Stays Baltimore',
    template: '%s | Baltimore Harbor Properties',
  },
  description: "Thoughtfully furnished executive stays in Baltimore's most walkable waterfront neighborhoods. Canton, Fells Point, Harbor East, and Inner Harbor.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Baltimore Harbor Properties — Furnished Stays Baltimore',
    description: 'Considered homes for business trips, medical rotations, relocations, and weekends by the water in Baltimore.',
    url: 'https://baltimore-harbor-properties.vercel.app',
    siteName: 'Baltimore Harbor Properties',
    images: [
      {
        url: '/assets/media/chase/bg--ce32e9ca5d88.webp',
        width: 1200,
        height: 630,
        alt: 'Baltimore Harbor Properties Baltimore Waterfront',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baltimore Harbor Properties — Furnished Stays Baltimore',
    description: 'Thoughtfully furnished executive stays in Baltimore waterfront neighborhoods.',
    images: ['/assets/media/chase/bg--ce32e9ca5d88.webp'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Baltimore Harbor Properties',
    image: '/assets/media/chase/bg--ce32e9ca5d88.webp',
    url: 'https://baltimore-harbor-properties.vercel.app/',
    telephone: '+1-410-218-8462',
    email: 'gonzalojouan@hotmail.com',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '3037 Hudson Street',
      addressLocality: 'Baltimore',
      addressRegion: 'MD',
      postalCode: '21224',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 39.2904,
      longitude: -76.6122,
    },
  };

  return (
    <html lang="en">
      <head>
        <link
          href="/assets/fonts/fonts.css"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <Header />
        {children}
      </body>
    </html>
  );
}
