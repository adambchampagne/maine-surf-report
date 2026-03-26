# Surf Report Rules

Lightweight Next.js app showing real-time surf conditions for southern Maine.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- No database — all data from free APIs (Open-Meteo, NDBC, NOAA)
- Deployed on Vercel

## Design System
- "Sand & Sea Glass" — warm sandy backgrounds, sea glass teal accent
- Font: Quicksand (Google Fonts)
- See globals.css for all CSS custom property tokens

## Conventions
- Server Components for data fetching (no client-side fetch)
- Only TideChart.tsx is a client component (needs browser time for NOW marker)
- API failures handled per-section, never crash the whole page
