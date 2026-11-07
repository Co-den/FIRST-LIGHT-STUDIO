# FIRST LIGHT STUDIO LTD website

Next.js 15 (App Router, JavaScript), Tailwind 4, Motion, Lucide.

## Run
    npm install
    cp .env.example .env.local
    npm run dev        # http://localhost:3000
    npm run lint
    npm run build && npm start

## Content
All content lives in src/data/site.js. Items with demo: true are placeholders. Contact email and site URL come from .env.local.

## Deploy to Vercel
Push to GitHub, import the repo in Vercel (framework: Next.js, no config needed), set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_CONTACT_EMAIL, deploy.

## Before launch, supply
Approved logo, hero and project artwork, real projects, characters and articles, studio milestones, contact email, social URLs, production domain, privacy policy and terms, and a backend or email service for the contact form (currently validates only and states that nothing is sent).
