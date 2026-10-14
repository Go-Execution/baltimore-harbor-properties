'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingBar() {
  const router = useRouter();
  const [checkin, setCheckin] = useState('');
  const [checkout, setCheckout] = useState('');
  const [guests, setGuests] = useState('2');
  const [message, setMessage] = useState('');
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    setMinDate(localToday);

    const d1 = new Date(today);
    d1.setDate(today.getDate() + 2);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 6);

    setCheckin(d1.toISOString().split('T')[0]);
    setCheckout(d2.toISOString().split('T')[0]);
  }, []);

  const handleCheckinChange = (val: string) => {
    setCheckin(val);
    if (checkout && checkout <= val) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 3);
      setCheckout(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) {
      setMessage('Please select valid check-in and check-out dates.');
      return;
    }
    if (checkout <= checkin) {
      setMessage('Check-out must be after check-in.');
      return;
    }
    setMessage(`Finding the best homes for ${guests} guests...`);
    router.push(`/properties?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&guests=${encodeURIComponent(guests)}`);
  };

  return (
    <section className="availability" id="availability" aria-label="Check availability">
      <form className="booking-bar" id="booking-form" onSubmit={handleSubmit}>
        <div className="booking-bar__intro">
          <span>Plan your stay</span>
          <strong>Find your Baltimore home</strong>
        </div>

        <label>
          <span>Check in</span>
          <input
            type="date"
            name="checkin"
            min={minDate}
            value={checkin}
            onChange={(e) => handleCheckinChange(e.target.value)}
            required
          />
        </label>

        <label>
          <span>Check out</span>
          <input
            type="date"
            name="checkout"
            min={checkin || minDate}
            value={checkout}
            onChange={(e) => setCheckout(e.target.value)}
            required
          />
        </label>

        <label>
          <span>Guests</span>
          <select
            name="guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            aria-label="Number of guests"
          >
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5">5 guests</option>
            <option value="6">6 guests</option>
          </select>
        </label>

        <button type="submit">
          Check stays <span>↗</span>
        </button>
      </form>
      {message && <p className="booking-message" role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
