import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const viewport: Viewport = {
  themeColor: '#17231f',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.chasestreetproperties.net'),
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
    url: 'https://www.chasestreetproperties.net',
    siteName: 'Baltimore Harbor Properties',
    images: [
      {
        url: 'https://www.chasestreetproperties.net/images/bg.webp',
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
    images: ['https://www.chasestreetproperties.net/images/bg.webp'],
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
    image: 'https://www.chasestreetproperties.net/images/bg.webp',
    url: 'https://www.chasestreetproperties.net/',
    telephone: '+1-410-218-8462',
    email: 'info@chasestreetproperties.net',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap"
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
