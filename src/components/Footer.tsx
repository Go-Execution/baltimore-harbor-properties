import React from 'react';
import Link from 'next/link';

export default function Footer({ showTopCta = true }: { showTopCta?: boolean }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      {showTopCta && (
        <div className="footer__top section-pad">
          <p className="eyebrow light">Your next stay starts here</p>
          <h2>Make Baltimore<br /><em>feel like home.</em></h2>
          <div className="footer__action">
            <p>Tell us what brings you to the city. We’ll help match you with a home that fits.</p>
            <Link className="round-cta" href="/contact">
              Start a conversation <span>↗</span>
            </Link>
          </div>
        </div>
      )}

      <div className="footer__middle section-pad" style={{ borderTop: showTopCta ? '1px solid rgba(255,255,255,.18)' : 'none' }}>
        <div className="footer__brand">
          <span className="brand__monogram">CS</span>
          <p>Chase Street<br />Properties</p>
        </div>

        <div className="footer__column">
          <span>Residences</span>
          <Link href="/properties?neighborhood=Canton">Canton Residences</Link>
          <Link href="/properties?neighborhood=Fells%20Point">Fells Point Stays</Link>
          <Link href="/properties?neighborhood=Inner%20Harbor">Inner Harbor Homes</Link>
          <Link href="/properties?neighborhood=Mount%20Vernon">Mount Vernon Suites</Link>
          <Link href="/properties">All 40+ Residences ↗</Link>
        </div>

        <div className="footer__column">
          <span>Explore & Services</span>
          <Link href="/attractions">Baltimore Attractions</Link>
          <Link href="/corporate-housing">Corporate & Medical Housing</Link>
          <Link href="/baltimore-guide">Neighborhood Guide</Link>
          <Link href="/about">Our Story & Ethos</Link>
          <Link href="/property-management">Turnkey Management & ROI</Link>
        </div>

        <div className="footer__column">
          <span>Portals & Standards</span>
          <Link href="/portal">Resident & Guest Portal</Link>
          <Link href="/portal">Property Owner Portal</Link>
          <Link href="/admin">Dedicated Admin Hub ↗</Link>
          <Link href="/policies">Stay Policies & Rules</Link>
          <Link href="/contact">Contact Concierge</Link>
        </div>

        <div className="footer__column">
          <span>Contact & Visit</span>
          <p>3037 Hudson Street<br />Baltimore, MD 21224</p>
          <a href="tel:+14102188462">+1 (410) 218-8462</a>
          <a href="mailto:gonzalojouan@hotmail.com">gonzalojouan@hotmail.com</a>
        </div>
      </div>

      <div className="footer__bottom section-pad">
        <span>© {currentYear} Chase Street Properties · Gonzalo Jouan</span>
        <span>Furnished Executive & Medical Stays · Baltimore, MD</span>
        <span>Platform engineered by Go Execution</span>
        <a href="#main">Back to top ↑</a>
      </div>
    </footer>
  );
}
