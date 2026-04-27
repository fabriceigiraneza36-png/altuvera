
# Country Backend: DB Schema and API

Overview
- Purpose: provide a robust, production-ready country data model that supports rich, media-heavy country pages, CMS-driven content blocks, internationalization, and efficient frontend hydration.
- Approach: use a primary `countries` table/collection for canonical metadata and JSONB columns for flexible page content, combined with normalized media and related tables/collections for scale.

Relational Schema (Postgres recommended)

-- Table: countries
-- Columns:
  - id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
  - slug: TEXT UNIQUE NOT NULL -- e.g. "Rwanda"
  - name: TEXT NOT NULL
  - region: TEXT
  - tagline: TEXT
  - excerpt: TEXT
  - hero_image: TEXT -- CDN URL
  - cover_image: TEXT -- higher-res hero/cover
  - meta: JSONB -- short keys for quick UI (population, area, capital)
  - seo: JSONB -- { title, description, ogImage, canonical }
  - page: JSONB -- CMS blocks and layout (see `page.blocks` below)
  - essentials: JSONB -- structured travel essentials (visa, health, currency, plugs)
  - quick_kpis: JSONB -- key numeric KPIs for UI cards (population, area, gdp)
  - stats: JSONB -- time-series or derived metrics
  - created_at: TIMESTAMPTZ DEFAULT now()
  - updated_at: TIMESTAMPTZ DEFAULT now()

-- Table: country_images (normalize media for scale)
-- Columns:
  - id: UUID PRIMARY KEY
  - country_id: UUID REFERENCES countries(id) ON DELETE CASCADE
  - role: TEXT NOT NULL -- e.g., hero, gallery, cover, thumbnail, signature
  - url: TEXT NOT NULL
  - alt: TEXT
  - credit: TEXT
  - width: INT
  - height: INT
  - focal_point: JSONB -- { x:0.5, y:0.4 }
  - metadata: JSONB
  - sort_order: INT

-- Table: country_blocks (optional per-block editing)
  - id, country_id, type (markdown, gallery, hero, faq, kpis), content JSONB, metadata JSONB

Indexes & Performance
- Primary index on `slug` and `id`.
- GIN indexes on JSONB columns used in queries: `page`, `essentials`, `seo`.
- Full-text search index on `name`, `tagline`, `excerpt`.
- Materialized views or cache layers (Redis / CDN) for heavy pages.

API Endpoints (recommended)

- GET /api/countries?limit=&offset=&region=&q=&fields=
  - Returns list of country summaries. `fields` controls projection (e.g., `fields=meta,seo`).

- GET /api/countries/:slug?fields=page,images,essentials,quick_kpis
  - Returns canonical country record merged with normalized images and blocks.
  - Supports `?preview=true` for CMS preview (auth required).

- POST /api/countries (admin)
  - Create or upsert a country record. Validates schema.

- PUT /api/countries/:slug (admin)
  - Update metadata, JSON blocks, or replace images (uploads go to CDN and create `country_images` rows).

- DELETE /api/countries/:slug (admin)

Payload design notes
- Prefer returning a compact summary for list endpoints (id, slug, name, excerpt, hero_image, meta).
- For page-level rendering, return `page.blocks` where each block has: `{ id, type, variant, content, props }` so the frontend can map blocks to components.
- Images may be returned separately as `images: [{ role, url, alt, credit, width, height }]` to allow lazy loading of specific roles (hero, gallery-page-1, thumbnail).

Example JSON structure (GET /api/countries/Rwanda)

```json
{
  "id": "uuid",
  "slug": "Rwanda",
  "name": "Rwanda",
  "tagline": "Magical Rwanda",
  "excerpt": "Land of wildlife, coastlines and culture.",
  "hero_image": "https://cdn.example.com/Rwanda/hero.jpg",
  "cover_image": "https://cdn.example.com/Rwanda/cover.jpg",
  "meta": { "population": "55.1M", "area": "580k km2", "capital": "Musanze" },
  "seo": { "title": "Rwanda travel guide", "description": "Rwanda travel info", "ogImage": "..." },
  "images": [ { "role":"hero", "url":"...", "alt":"..." }, { "role":"gallery", "url":"..." } ],
  "quick_kpis": { "gdp": "$113B", "gdp_per_capita": "$2,100" },
  "essentials": { "visa": { "required": true, "note": "Apply online" }, "health": { "yellow_fever": true } },
  "page": {
    "blocks": [
      { "id":"hero", "type":"hero", "variant":"slideshow", "props": { "imagesRole": "hero" } },
      { "id":"overview", "type":"content", "variant":"two-column", "content": "<p>Full HTML or markdown</p>" },
      { "id":"signature_experiences", "type":"cards", "content": [ {"title":"Hot Air Balloon","excerpt":""} ] },
      { "id":"gallery", "type":"gallery", "props": { "imageRole": "gallery" } },
      { "id":"kpis", "type":"kpi_row" }
    ]
  }
}
```

Media handling
- Upload images to your CDN (S3, Cloudflare R2, etc.), store canonical URLs in `country_images`, and reference roles in `page.blocks` to avoid duplicating image metadata inside page content.

Seeding strategy
- Ship a seed file (JSON/JS) that populates `countries` and `country_images` for each market. Provide an import script (node or psql) to upsert records.

Security & Operational Notes
- Admin endpoints must be authenticated and CSRF-protected for web forms.
- Limit JSONB sizes; for very large galleries store separate `country_images` and paginate.
- Use CDN edge caching and stale-while-revalidate patterns for high-traffic pages.

Migration & Next Steps
- Provide migration scripts to create tables and indexes.
- Provide seed sample `src/data/country-seed-enhanced.js` (example format) to populate DB during development.

Client usage
- Frontend should progressively request `GET /api/countries/:slug?fields=page,images,essentials,quick_kpis` and render `page.blocks` with clean component mappings.



