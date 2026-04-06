# Kismat Event Page

A standalone single-page event landing page with Y2K retro aesthetic, built for [Kismat India](https://kismatindia.com).

## Features

- Y2K retro design with chrome text, neon glows, glassmorphism, and CRT scanlines
- Registration form (name, age, phone, gender, email, Instagram)
- QR code payment flow with screenshot upload
- Supabase backend for storing registrations and payment screenshots
- Mobile-first, no build step required

## Quick Start

1. Open `index.html` in a browser, or serve locally:
   ```bash
   python3 -m http.server 8888
   ```
2. Visit `http://localhost:8888`

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Framework Preset: **Other** (static site)
4. Click Deploy — done!

The `vercel.json` is already configured for routing and caching.

## Supabase Setup

Before the form works, run `setup.sql` in your Supabase SQL Editor to create the `event_registrations` table. Also create a storage bucket called `payment-screenshots` (public, 5 MB limit).

## Customizing for Your Event

Edit these in `index.html`:
- Event name, date, venue, price in the hero and details sections

Edit these in `script.js`:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_ANON_KEY` — your Supabase anon key
- `EVENT_SLUG` — unique identifier for this event
- `PAYMENT_UPI_ID` — your UPI ID

Replace `payment-qr-code.png` with your own QR code image.

## Tech Stack

- HTML / CSS / Vanilla JS (no frameworks, no build step)
- Google Fonts (Orbitron + Space Grotesk)
- Supabase JS SDK (loaded via CDN)
