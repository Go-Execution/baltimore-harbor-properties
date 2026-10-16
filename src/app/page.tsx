'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import BookingBar from '@/components/BookingBar';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Intro Animation Overlay */}
      <div className={`intro ${introFinished ? 'is-finished' : ''}`} aria-hidden="true">
        <div className="intro__grain"></div>
        <div className="intro__mark">
          <svg viewBox="0 0 120 120" role="img" aria-label="Chase Street Properties">
            <path d="M90 28c-8-9-18-13-30-13-25 0-43 19-43 45s18 45 43 45c12 0 23-4 31-13" />
            <path d="M99 40c-4-8-12-12-22-12-13 0-22 7-22 17 0 24 45 11 45 39 0 11-10 20-25 20-10 0-19-4-24-11" />
          </svg>
          <p>Chase Street Properties</p>
          <span>Baltimore · Maryland</span>
        </div>
      </div>

      <main id="main">
        {/* Hero Section */}
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero__sticky">
            <div className="hero__media" data-hero-media>
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="https://www.chasestreetproperties.net/images/bg.webp"
              >
                <source src="https://www.chasestreetproperties.net/images/Gonzalo.mp4" type="video/mp4" />
              </video>
              <div className="hero__scrim"></div>
            </div>

            <div className="hero__content" data-hero-content>
              <p className="eyebrow light"><span></span> Furnished stays · Baltimore</p>
              <h1 id="hero-title">Live like<br /><em>you belong.</em></h1>
              <div className="hero__lower">
                <p>Considered homes for business trips, relocations and weekends by the water.</p>
                <a className="circle-link light" href="#story">
                  <span>Discover</span><i>↓</i>
                </a>
              </div>
            </div>

            <p className="hero__side-note">39.2904° N · 76.6122° W</p>
            <div className="hero__reframe" aria-hidden="true">
              <span>YOUR BALTIMORE ADDRESS</span>
              <p>Stay awhile.</p>
            </div>
            <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><i></i></div>
          </div>
        </section>

        {/* Booking Bar Form */}
        <BookingBar />

        {/* Story Section */}
        <section className="story section-pad" id="story">
          <div className="chapter-line">
            <span>01 — Our story</span>
            <span>A different way to stay</span>
          </div>

          <div className="story__heading">
            <h2>Arrive in Baltimore.<br /><em>Feel at home.</em></h2>
            <div className="story__copy">
              <p>We turn extended stays into an experience that feels easy, personal and genuinely local.</p>
              <p>More than forty furnished homes, each ready from day one—beautifully considered, professionally cared for, and close to the places that make Baltimore memorable.</p>
              <Link className="text-link" href="/properties">
                Explore the collection <span>↗</span>
              </Link>
            </div>
          </div>

          <div className="story__collage">
            <figure className="story__image story__image--large">
              <img
                src="https://www.chasestreetproperties.net/images/about.webp"
                alt="Light-filled furnished living room at Chase Street Properties"
                loading="lazy"
              />
              <figcaption><span>01</span> Spaces made for real life</figcaption>
            </figure>
            <div className="story__note">
              <span className="handwritten">No hotel routine.</span>
              <p>Just your own front door, your own rhythm, and a city waiting outside.</p>
            </div>
            <figure className="story__image story__image--small">
              <img
                src="https://www.chasestreetproperties.net/images/about2.webp"
                alt="Warm bedroom in a Baltimore furnished rental"
                loading="lazy"
              />
              <figcaption><span>02</span> Details that feel personal</figcaption>
            </figure>
          </div>

          <div className="story__facts" aria-label="Chase Street Properties facts">
            <div><strong>40<sup>+</sup></strong><span>Furnished<br />homes</span></div>
            <div><strong>03<sup>+</sup></strong><span>Night minimum<br />stay</span></div>
            <div><strong>24/7</strong><span>Self check-in<br />& support</span></div>
            <div><strong>01</strong><span>Remarkable<br />Baltimore</span></div>
          </div>
        </section>

        {/* Collection Section */}
        <section className="collection" id="stays">
          <div className="collection__intro section-pad">
            <div className="chapter-line">
              <span>02 — The stays</span>
              <span>Selected residences</span>
            </div>
            <div className="collection__heading">
              <h2>A place for<br /><em>every pace.</em></h2>
              <p>From quiet solo retreats to generous homes for the whole crew. Every stay has its own character—and the same high standard of comfort.</p>
            </div>
          </div>

          <div className="stay-list">
            <article className="stay-card" data-index="01">
              <Link className="stay-card__media" href="/properties/1">
                <img
                  src="https://www.chasestreetproperties.net/uploads/property_list_img/5eca3b19-9431-47d2-b928-0a6a2b1f671e_1660155115_1660170093_1660669083_1661532110.jpg"
                  alt="Cozy and quiet Baltimore retreat"
                  loading="lazy"
                />
                <span className="stay-card__number">01 / 03</span>
                <span className="stay-card__view">View stay ↗</span>
              </Link>
              <div className="stay-card__body">
                <div>
                  <p className="eyebrow">Canton · Baltimore</p>
                  <h3>Quiet<br /><em>Retreat</em></h3>
                </div>
                <div className="stay-card__details">
                  <p>A calm, private base with seamless self check-in—made for the independent traveler.</p>
                  <ul><li>2 guests</li><li>1 bed</li><li>1 bath</li></ul>
                  <p className="price">From <strong>$99</strong> / night</p>
                </div>
              </div>
            </article>

            <article className="stay-card stay-card--reverse" data-index="02">
              <Link className="stay-card__media" href="/properties/2">
                <img
                  src="https://www.chasestreetproperties.net/uploads/property_list_img/hudsonliving_1661518528_1661532267.jpg"
                  alt="Fantastic Canton home near Johns Hopkins"
                  loading="lazy"
                />
                <span className="stay-card__number">02 / 03</span>
                <span className="stay-card__view">View stay ↗</span>
              </Link>
              <div className="stay-card__body">
                <div>
                  <p className="eyebrow">Hudson Street · Canton</p>
                  <h3>The<br /><em>Townhouse</em></h3>
                </div>
                <div className="stay-card__details">
                  <p>A characterful city home near Johns Hopkins and Bayview, with room to settle in.</p>
                  <ul><li>4 guests</li><li>3 beds</li><li>1.5 baths</li></ul>
                  <p className="price">From <strong>$149</strong> / night</p>
                </div>
              </div>
            </article>

            <article className="stay-card" data-index="03">
              <Link className="stay-card__media" href="/properties/3">
                <img
                  src="https://www.chasestreetproperties.net/uploads/property_list_img/6acf57d7-4d5c-403c-ab68-fccffbd1828a_1660161150.webp"
                  alt="Spacious Baltimore home near Inner Harbor"
                  loading="lazy"
                />
                <span className="stay-card__number">03 / 03</span>
                <span className="stay-card__view">View stay ↗</span>
              </Link>
              <div className="stay-card__body">
                <div>
                  <p className="eyebrow">Inner Harbor · Downtown</p>
                  <h3>Harbor<br /><em>House</em></h3>
                </div>
                <div className="stay-card__details">
                  <p>A spacious city stay close to the Convention Center, stadiums and waterfront landmarks.</p>
                  <ul><li>6 guests</li><li>6 beds</li><li>1 bath</li></ul>
                  <p className="price">From <strong>$149</strong> / night</p>
                </div>
              </div>
            </article>
          </div>

          <div className="collection__footer section-pad">
            <p>Looking for a specific neighborhood or dates?</p>
            <Link href="/properties">
              Browse all 40+ residences <span>↗</span>
            </Link>
          </div>
        </section>

        {/* Promise Standards Section */}
        <section className="promise">
          <div className="promise__media">
            <img src="https://www.chasestreetproperties.net/images/bg.webp" alt="View over Baltimore waterfront" loading="lazy" />
          </div>
          <div className="promise__content section-pad">
            <p className="eyebrow light">What comes standard</p>
            <h2>Everything you need.<br /><em>Nothing you don’t.</em></h2>
            <div className="promise__grid">
              <article><span>01</span><h3>Move-in ready</h3><p>Furnished, connected and stocked with the essentials before you arrive.</p></article>
              <article><span>02</span><h3>Live like a local</h3><p>Walkable addresses near the harbor, hospitals, campuses and neighborhood favorites.</p></article>
              <article><span>03</span><h3>Here when needed</h3><p>Responsive local support and simple self check-in, day or night.</p></article>
              <article><span>04</span><h3>Stay your way</h3><p>Flexible homes for a few nights, a project assignment, or a fresh beginning.</p></article>
            </div>
          </div>
        </section>

        {/* Baltimore Section */}
        <section className="baltimore section-pad" id="baltimore">
          <div className="chapter-line">
            <span>03 — The city</span>
            <span>At your doorstep</span>
          </div>
          <div className="baltimore__heading">
            <h2>The charm is<br /><em>in the details.</em></h2>
            <div>
              <p>Brick rowhomes. Harbor light. Creative kitchens and storied streets. Baltimore rewards those who get close enough to know it.</p>
              <Link className="text-link" href="/baltimore-guide" style={{ marginTop: 20 }}>
                Explore neighborhood & medical guide <span>↗</span>
              </Link>
            </div>
          </div>
          <div className="places">
            <Link className="place place--harbor" href="/attractions/inner-harbor">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/usa-maryland-baltimore-inner-harbor_1691259038.jpg" alt="Baltimore Inner Harbor" loading="lazy" />
              <span>01</span><h3>Inner Harbor</h3><p>Waterfront · 8 min · Guide & Stays ↗</p>
            </Link>
            <Link className="place place--walters" href="/attractions/walters-art-museum">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-walters-art-museum-staircase.jpg" alt="Grand staircase inside the Walters Art Museum" loading="lazy" />
              <span>02</span><h3>The Walters</h3><p>Art & culture · 12 min · Guide & Stays ↗</p>
            </Link>
            <Link className="place place--fort" href="/attractions/fort-mchenry">
              <img src="https://www.chasestreetproperties.net/uploads/things_to_do/1/maryland-top-attractions-fort-mchenry-national-monument.jpg" alt="Fort McHenry National Monument" loading="lazy" />
              <span>03</span><h3>Fort McHenry</h3><p>History · 10 min · Guide & Stays ↗</p>
            </Link>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="testimonial section-pad">
          <div className="testimonial__mark">“</div>
          <blockquote>Excellent location, safe and very close to the Inner Harbor. The team was phenomenal—truly an excellent stay.</blockquote>
          <div className="testimonial__meta">
            <span>Aaron</span>
            <span>Verified guest</span>
            <span>★★★★★</span>
          </div>
        </section>
      </main>

      <Footer showTopCta={true} />
    </>
  );
}
