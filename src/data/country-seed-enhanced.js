// Enhanced country seed sample for development / DB seeding.
// This file contains compact, rich country objects and a small set of normalized images.
// Use with an import script to upsert into Postgres (countries + country_images).

export const enhancedCountries = [
  {
    id: "kenya",
    slug: "kenya",
    name: "Kenya",
    tagline: "Magical Kenya",
    excerpt: "A land of epic wildlife, dramatic landscapes and rich coastal culture.",
    hero_image: "https://cdn.example.com/kenya/hero.jpg",
    cover_image: "https://cdn.example.com/kenya/cover.jpg",
    meta: { population: "55.1M", area: "580,367 km²", capital: "Nairobi" },
    seo: { title: "Kenya travel guide — Altuvera", description: "Kenya travel essentials and experiences." },
    quick_kpis: { gdp: "$113B", gdp_per_capita: "$2,100", currency: "KES" },
    essentials: {
      visa: { required: true, note: "Electronic Travel Authorization (apply online)" },
      health: { yellow_fever: true, malaria: true, covid_recommendation: "check local rules" },
      currency: { code: "KES", symbol: "KSh" },
      plugs: ["Type G"],
    },
    images: [
      { role: "hero", url: "https://images.unsplash.com/photo-kenya-hero-1.jpg", alt: "Elephants at Amboseli", credit: "Unsplash" },
      { role: "hero", url: "https://images.unsplash.com/photo-kenya-hero-2.jpg", alt: "Maasai Mara sunset", credit: "Unsplash" },
      { role: "gallery", url: "https://images.unsplash.com/kenya-gallery-1.jpg", alt: "Giraffes", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/kenya-gallery-2.jpg", alt: "Diani Beach", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/kenya-gallery-3.jpg", alt: "Mount Kenya", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/kenya-gallery-4.jpg", alt: "Nairobi skyline", credit: "Photographer" },
      { role: "signature", url: "https://images.unsplash.com/kenya-signature-1.jpg", alt: "Hot air balloon", credit: "Photographer" },
      { role: "thumbnail", url: "https://images.unsplash.com/kenya-thumb.jpg", alt: "Kenya thumbnail", credit: "Photographer" },
      { role: "map", url: "https://cdn.example.com/maps/kenya-map.png", alt: "Map of Kenya", credit: "Altuvéra" }
    ],
    page: {
      blocks: [
        { id: "hero", type: "hero", variant: "slideshow", props: { imagesRole: "hero", autoplay: true } },
        { id: "overview", type: "content", variant: "default", content: "<p>Kenya is an outstanding destination for wildlife, culture and coast.</p>" },
        { id: "signature_experiences", type: "cards", variant: "featured", content: [ { title: "Great Migration", excerpt: "Witness the Great Wildebeest Migration." } ] },
        { id: "gallery", type: "gallery", props: { imageRole: "gallery", columns: 3 } },
        { id: "essentials", type: "essentials", props: {} },
        { id: "kpis", type: "kpi_row" }
      ]
    }
  },

  {
    id: "tanzania",
    slug: "tanzania",
    name: "Tanzania",
    tagline: "The Soul of Africa",
    excerpt: "Home to Kilimanjaro, Serengeti and Zanzibar — epic safari & island escapes.",
    hero_image: "https://cdn.example.com/tanzania/hero.jpg",
    cover_image: "https://cdn.example.com/tanzania/cover.jpg",
    meta: { population: "65.5M", area: "947,303 km²", capital: "Dodoma" },
    seo: { title: "Tanzania travel guide — Altuvera", description: "Tanzania travel essentials and experiences." },
    quick_kpis: { gdp: "$64B", gdp_per_capita: "$980", currency: "TZS" },
    essentials: {
      visa: { required: true, note: "eVisa available" },
      health: { yellow_fever: true, malaria: true },
      currency: { code: "TZS", symbol: "TSh" },
      plugs: ["Type G", "Type D"]
    },
    images: [
      { role: "hero", url: "https://images.unsplash.com/tz-hero-1.jpg", alt: "Serengeti migration", credit: "Unsplash" },
      { role: "hero", url: "https://images.unsplash.com/tz-hero-2.jpg", alt: "Kilimanjaro", credit: "Unsplash" },
      { role: "gallery", url: "https://images.unsplash.com/tz-gallery-1.jpg", alt: "Ngorongoro Crater", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/tz-gallery-2.jpg", alt: "Zanzibar beach", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/tz-gallery-3.jpg", alt: "Hot air balloon", credit: "Photographer" },
      { role: "gallery", url: "https://images.unsplash.com/tz-gallery-4.jpg", alt: "Stone Town", credit: "Photographer" },
      { role: "thumbnail", url: "https://images.unsplash.com/tz-thumb.jpg", alt: "Tanzania thumbnail", credit: "Photographer" }
    ],
    page: {
      blocks: [
        { id: "hero", type: "hero", variant: "slideshow", props: { imagesRole: "hero" } },
        { id: "overview", type: "content", variant: "default", content: "<p>Tanzania combines world-class safari and Indian Ocean islands.</p>" },
        { id: "signature_experiences", type: "cards", variant: "featured", content: [ { title: "Kilimanjaro summit", excerpt: "Iconic climb to Uhuru Peak." } ] },
        { id: "gallery", type: "gallery", props: { imageRole: "gallery", columns: 4 } },
        { id: "essentials", type: "essentials" }
      ]
    }
  }
];

export default enhancedCountries;
