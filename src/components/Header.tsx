'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePropertyStore } from '@/utils/usePropertyStore';

export default function Header() {
  const [isSolid, setIsSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { settings, isLoaded } = usePropertyStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsSolid(window.scrollY > 55 || pathname !== '/');
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [pathname]);

  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    document.body.classList.toggle('menu-open', next);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const showBanner = isLoaded && settings.bannerEnabled === 'true' && settings.bannerText;

  return (
    <>
      {/* Dynamic Announcement Banner (SOW §5 Website Settings) */}
      {showBanner && (
        <div
          style={{
            background: 'var(--copper)',
            color: '#fff',
            padding: '6px 16px',
            textAlign: 'center',
            fontSize: '0.72rem',
            fontWeight: 500,
            letterSpacing: '0.02em',
            position: 'relative',
            zIndex: 1001,
          }}
        >
          <span>{settings.bannerText}</span>
          <Link
            href="/contact"
            style={{
              color: '#fff',
              textDecoration: 'underline',
              marginLeft: 8,
              fontWeight: 700,
            }}
          >
            Inquire Now →
          </Link>
        </div>
      )}

      <header className={`site-header ${isSolid || pathname !== '/' ? 'is-solid' : ''}`} data-header>
        <Link href="/" className="brand" aria-label="Chase Street Properties, home">
          <span className="brand__monogram">CS</span>
          <span className="brand__name">Chase Street <small>Properties</small></span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/properties" className={isActive('/properties') ? 'is-active' : ''}>
            The Stays
          </Link>
          <Link href="/about" className={isActive('/about') ? 'is-active' : ''}>
            Our Story
          </Link>
          <Link href="/property-management" className={isActive('/property-management') ? 'is-active' : ''}>
            For Owners
          </Link>
          <Link href="/baltimore-guide" className={isActive('/baltimore-guide') ? 'is-active' : ''}>
            Baltimore Guide
          </Link>
          <Link href="/contact" className={isActive('/contact') ? 'is-active' : ''}>
            Contact
          </Link>
        </nav>

        <div className="header-actions">
          <Link href="/portal" className="nav-portal-pill" title="Access Resident & Owner Portals">
            <span className="pulse-dot"></span> Portals Hub
          </Link>
          <Link href="/properties" className="header-book">
            Book a stay <span>↗</span>
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <span></span><span></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <Link href="/properties" onClick={() => setMenuOpen(false)}>
            <span>01</span> The Stays
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            <span>02</span> Our Story
          </Link>
          <Link href="/property-management" onClick={() => setMenuOpen(false)}>
            <span>03</span> For Owners
          </Link>
          <Link href="/baltimore-guide" onClick={() => setMenuOpen(false)}>
            <span>04</span> Baltimore Guide
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            <span>05</span> Contact
          </Link>
          <Link href="/portal" onClick={() => setMenuOpen(false)} style={{ color: 'var(--sand)' }}>
            <span>06</span> Portals Hub ↗
          </Link>
        </nav>
        <div className="mobile-menu__footer">
          <a href="tel:+14102188462">+1 410 218 8462</a>
          <a href="mailto:info@chasestreetproperties.net">info@chasestreetproperties.net</a>
        </div>
      </div>
    </>
  );
}
