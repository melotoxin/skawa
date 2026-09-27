# SKAWA Fight frontend

Premium React + TypeScript storefront prototype for SKAWA Fight. It includes the flagship homepage, true procedural WebGL product presentation, catalog, product detail pages, 2D-first customizer, academy and private-label journeys, manufacturing story, sample-kit and project-brief flows, demonstration portfolio, local project hub, and nine-stage order tracking.

## Run locally

```powershell
npm install
npm run dev
```

Open the address printed by Vite. To create a deployable static build:

```powershell
npm run build
npm run preview
```

The production files are written to `dist/`. Configure the host to return `index.html` for unknown paths because routing is handled in the browser.

## Homepage

The homepage lives in `src/components/home/` as one component per section (hero, customer paths, process, craftsmanship, product showcase, Design Lab preview, academy, private label, offers, proof, discipline wall, final CTA), composed in `src/StorefrontHome.tsx`. The site header (`src/components/Nav.tsx`) and footer (`src/components/SiteFooter.tsx`) are shared by every page.

- **Copy, links and facts:** edit `src/components/home/content.ts`. Numbers, testimonials, client logos and social profiles render only when real entries are added there (`siteFacts`, `testimonials`, `clientLogos`, `socialProfiles`).
- **Design tokens:** `src/skawa-system.css` (`--sk-*` colors, spacing, radius, shadows, glass, motion).
- **Images:** optimized WebP derivatives are generated into `public/images/home/` with `node scripts/build-home-assets.mjs`. The hero athlete cutout is produced by `scripts/cut-hero-athlete.py` (requires `rembg`).

## Production handoff

- Product imagery, concepts, pricing, lead submissions, order data, account data, and portfolio entries are explicitly presented as demo/local content where they are not connected to verified services.
- Replace the procedural shorts model with approved GLB/GLTF geometry and UV maps when production assets are available.
- Connect commerce, CRM, authentication, order-tracking, fulfillment, and analytics services before launch.
- Add only verified testimonials, clients, certifications, countries served, and operating statistics.

