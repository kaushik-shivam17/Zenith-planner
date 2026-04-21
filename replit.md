# Project Overview

Next.js 15 app (App Router) migrated from Vercel to Replit.

## Stack
- Next.js 15 + React 18, TypeScript
- Tailwind CSS, Radix UI, Framer Motion
- Firebase (client SDK)
- Genkit + Google Gemini for AI features
- Blink SDK

## Replit Setup
- Dev/start scripts bind to `0.0.0.0:5000` (required for Replit preview).
- Workflow `Start application` runs `npm run dev`.

## Environment Variables
The app reads these at runtime (set via Replit Secrets when needed):
- `NEXT_PUBLIC_FIREBASE_*` — Firebase client config (API key, auth domain, project id, etc.)
- `GEMINI_API_KEY` (or `NEXT_PUBLIC_GEMINI_API_KEY`) — for Genkit/Gemini AI features

The app starts without these; AI/Firebase features will surface their own errors until configured.

## Notes
- `apphosting.yaml`, `.firebaserc`, and `firestore.rules` retained for Firebase tooling but not required to run the dev server.
