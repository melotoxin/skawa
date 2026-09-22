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

## Production handoff

- Product imagery, concepts, pricing, lead submissions, order data, account data, and portfolio entries are explicitly presented as demo/local content where they are not connected to verified services.
- Replace the procedural shorts model with approved GLB/GLTF geometry and UV maps when production assets are available.
- Connect commerce, CRM, authentication, order-tracking, fulfillment, and analytics services before launch.
- Add only verified testimonials, clients, certifications, countries served, and operating statistics.

