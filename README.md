# Altuvera Safaris

<p align="center">
  <strong>Discover Africa. Travel deeper. Make every journey count.</strong>
  <br />
  A modern, responsive safari and travel experience for discovering destinations, planning trips, and connecting with local expertise across Africa.
  <br /><br />
  <a href="https://www.altuverasafaris.com">Visit the live website</a>
</p>

---

## Overview

**Altuvera Safaris** is the public-facing web application for exploring African travel experiences. It brings destination discovery, safari packages, travel information, galleries, customer accounts, booking requests, and direct communication together in one responsive experience.

The application is built with React and Vite, uses a shared API backend for dynamic content, and is deployed through Vercel.

- **Live website:** https://www.altuverasafaris.com
- **Repository:** https://github.com/fabriceigiraneza36-png/altuvera
- **Frontend framework:** React 18
- **Build tool:** Vite
- **Production hosting:** Vercel
- **Default API service:** `https://backend-jd8f.onrender.com/api` (can be overridden through environment configuration)

## Product highlights

### Explore and plan travel
- Browse countries, destinations, safari packages, attractions, and travel experiences.
- View destination photography, galleries, and detailed travel information.
- Discover services, travel tips, FAQs, testimonials, and editorial content.
- Submit booking requests and review trip information.
- Navigate destination and package pages through responsive layouts designed for mobile and desktop.

### Customer experience
- Responsive navigation and mobile-friendly page layouts.
- Account and authentication flows, including protected routes.
- User notifications, messaging, and wishlist-related experiences.
- Booking identity verification and booking confirmation flows.
- Direct WhatsApp contact and in-site message entry points.
- Accessible interactive components, animated transitions, and image fallbacks.

### Content and media
- Dynamic public content retrieved from the backend API.
- Destination, country, team, gallery, package, and editorial content surfaces.
- Image-loading fallbacks to keep layouts usable when an image fails.
- Team profile cards with an expanded profile/photo experience.
- Search-engine metadata and generated SEO assets.

### Reliability and performance
- Lazy-loaded route and media components where appropriate.
- Shared API client and public-data warmup to reuse commonly requested content.
- Error boundaries and recovery handling for failed lazy-loaded chunks.
- Consent-mode initialization before analytics-related tracking.
- Vercel Analytics integration.
- Production asset chunking and optimized Vite builds.

> Available content and actions can depend on backend availability, configured integrations, account permissions, and the data published by administrators.

## Technology stack

| Area | Technologies |
| --- | --- |
| UI | React 18, JSX, CSS, Tailwind CSS 4 |
| Development and build | Vite 8, ESLint |
| Routing | React Router 6 |
| State management | Redux Toolkit, React context |
| Motion | Framer Motion |
| Icons | Lucide React, React Icons |
| API requests | Axios and application API utilities |
| Maps | Leaflet, React Leaflet, Google Maps API integration |
| Authentication | Application auth flows, Google sign-in integration, WebAuthn browser support |
| SEO | React Helmet Async, Schema.org helpers, sitemap tooling, project SEO generator |
| Analytics | Vercel Analytics |
| Hosting | Vercel |
| Media and data | Backend API; media may be served by configured image services |

## Getting started

### Requirements

Install the following before running the application:

- Node.js version compatible with the installed Vite release (Node.js 20.19+ or 22.12+ is recommended for Vite 8).
- npm.
- Access to the backend API for dynamic data and authenticated features.

### 1. Clone the repository

```bash
git clone https://github.com/fabriceigiraneza36-png/altuvera.git
cd altuvera
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file in the project root if you need to override defaults. Never commit credentials, API secrets, private keys, or production tokens.

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Optional API base URL. The Vite configuration removes a trailing `/api` when setting its development proxy target; page-level API clients may use this value as their full API base URL. |
| `VITE_API_BASE_URL` | Optional fallback API base URL used by selected page-level clients. |
| `VITE_GOOGLE_MAPS_API_KEY` | Configure only if required by the Google Maps features in your environment. |
| `VITE_* ` | Other public build-time configuration may be used by individual features. Only expose values safe for browsers. |

When no API URL is supplied, the project configuration defaults to the Altuvera backend at `https://backend-jd8f.onrender.com/api`. Confirm that this service is available before debugging dynamic content locally.

Example local configuration:

```dotenv
VITE_API_URL=https://backend-jd8f.onrender.com/api
```

Do not put server-side secrets in variables prefixed with `VITE_`: Vite exposes these values to client-side code.

### 4. Start the development server

```bash
npm run dev
```

Vite is configured to use port `5174` by default and may choose another available port if needed. The development server listens on network interfaces so it can be tested on another device on the same network.

### 5. Build for production

```bash
npm run build
```

The production build runs the SEO generation script and then builds the frontend with Vite. Generated output is written to `dist/`.

### 6. Preview the production build locally

```bash
npm run preview
```

### Additional scripts

```bash
npm run lint
npm run dev:test
npm run seo:generate
```

- `npm run lint` checks JavaScript and JSX under `src/`.
- `npm run dev:test` opens the configured Tailwind test route.
- `npm run seo:generate` runs the SEO generation script independently.

## Project structure

The codebase is organized by application responsibility. The following describes the main source areas; individual files may change as the application evolves.

```text
altuvera/
├── public/                 # Static public assets
├── scripts/                # Build and SEO generation scripts
├── src/
│   ├── assets/             # Imported visual assets
│   ├── components/         # Shared UI and feature components
│   │   ├── auth/            # Authentication and protected-flow UI
│   │   └── common/          # Navbar, footer, loaders, shared UI
│   ├── context/             # Shared React contexts
│   ├── data/                # Local/static content data
│   ├── hooks/               # Reusable React hooks
│   ├── pages/               # Route-level pages and flows
│   ├── services/             # API and application services
│   ├── utils/                # Shared utilities and API helpers
│   ├── App.jsx               # Application routes and shell
│   ├── main.jsx              # React entry point and providers
│   └── index.css             # Global styling
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## API and integrations

The frontend communicates with the backend through API clients and page-level services. The Vite development server proxies `/api` requests to the configured backend target.

Common public data endpoints warmed by the application include:

- `/countries`
- `/destinations`
- `/posts`
- `/services`
- `/team`
- `/gallery`
- `/faqs`
- `/testimonials`
- `/tips`
- `/pages`

These endpoint names describe frontend requests, not a guarantee that every endpoint will always be available. Verify backend routes, response formats, CORS, and service health when diagnosing data-loading issues.

Integrations used by application features include maps, authentication, analytics, image/media services, and external WhatsApp links. Enable and configure each integration in the appropriate provider and environment. Do not store private credentials in frontend source code.

## Deployment

The public website is hosted on Vercel and connected to the GitHub repository.

Typical deployment workflow:

1. Create and review changes on a branch.
2. Run `npm install`, `npm run lint`, and `npm run build` locally.
3. Push the branch to GitHub and review the preview deployment.
4. Merge or push to the configured production branch.
5. Confirm that the Vercel deployment reaches **Ready**.
6. Smoke-test the live website, especially dynamic destination and package pages, images, authentication, booking requests, and contact actions.

A successful Git commit or a queued deployment does **not** by itself confirm a successful production release. Review build logs and test the deployed site after each release.

### Production checklist

- [ ] Production build completes without errors.
- [ ] Required environment variables are set in Vercel.
- [ ] Backend API is reachable and returns expected data.
- [ ] Destination and package detail pages load on mobile and desktop.
- [ ] Images and logos load with useful fallbacks.
- [ ] Navigation, modals, and icons remain visible against changing backgrounds.
- [ ] Authentication, booking, messaging, and WhatsApp links work as configured.
- [ ] SEO metadata and generated sitemap assets are current.
- [ ] No secrets or private environment files are committed.

## Development guidelines

- Keep public-facing pages responsive across small phones, tablets, and desktop screens.
- Prefer shared components and existing project conventions over duplicated UI logic.
- Use locally bundled icon components rather than fragile remote icon-image URLs for interface controls.
- Include loading, empty, error, and retry states for API-driven views.
- Validate API responses before rendering nested objects or media fields.
- Use accessible names, keyboard-operable controls, visible focus states, and reduced-motion support.
- Keep user-facing copy professional, accurate, and free of unverified promises.
- Preserve existing behavior unless a change explicitly requires updating it.
- Avoid committing credentials, customer data, tokens, or production environment files.

## Troubleshooting

**A destination or team page does not load**
- Confirm the backend service is awake and reachable.
- Check the browser Network panel for the request URL, HTTP status, response body, and CORS errors.
- Confirm the endpoint returns the shape expected by the page.
- Check timeout and retry behavior; retries cannot repair a permanently unavailable endpoint.

**Images or icons are missing**
- Check the image URL and browser Network panel.
- Confirm the referenced static asset exists at the requested public path.
- Prefer bundled React icon components for interface icons.
- Verify media-service permissions and fallback behavior.

**A Vercel deployment fails**
- Open the deployment build logs and fix the first actual compiler or build error.
- Verify environment variables and the Node.js version used in the build environment.
- Run `npm run build` locally before retrying.
- Confirm the newest deployment reaches **Ready** before testing production.

**Local API requests fail**
- Confirm `VITE_API_URL` points to the expected backend.
- Check the development proxy configuration in `vite.config.js`.
- Confirm the backend route, CORS rules, and service health.

## Contributing

1. Create a focused branch for your change.
2. Keep changes small and explain their purpose in the commit message.
3. Test responsive layouts and the affected user flow.
4. Run the lint and production build scripts.
5. Open a pull request or submit the change through the repository's normal review process.

## Security and privacy

- Treat all browser-delivered code and `VITE_*` variables as public.
- Keep private keys, service credentials, and server-only configuration out of the frontend repository.
- Avoid logging authentication tokens or personal customer data.
- Follow the consent and privacy requirements applicable to analytics and authentication integrations.
- Report suspected vulnerabilities privately to the repository maintainers rather than publishing exploitable details.

## License

No license terms are specified here. Contact the repository owner before redistributing or reusing the project beyond permissions granted by the repository's applicable license.

---

<p align="center">
  <strong>Altuvera Safaris</strong><br />
  Thoughtful journeys. Authentic African experiences.
  <br /><br />
  <a href="https://www.altuverasafaris.com">altuverasafaris.com</a>
</p>
