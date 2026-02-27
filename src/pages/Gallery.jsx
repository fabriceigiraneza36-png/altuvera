import React, { useState, useMemo, useEffect, useCallback } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiHome } from "react-icons/fi";

// -------------------- Styles (inline) --------------------
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: #f4f7f4;
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ----- Hero Slideshow ----- */
  .hero {
    position: relative;
    height: 70vh;
    min-height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    margin-bottom: 60px;
    overflow: hidden;
    background: #2b4b2b; /* fallback */
  }

  .slideshow-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
  }

  .slide.active {
    opacity: 1;
  }

  /* Dark overlay for text readability */
  .hero::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(20, 40, 20, 0.4);
    pointer-events: none;
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    padding: 0 20px;
  }

  .hero h1 {
    font-size: 4.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
    margin-bottom: 16px;
    animation: heroTextGlow 3s infinite alternate ease-in-out;
  }
  @keyframes heroTextGlow {
    from { text-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    to { text-shadow: 0 8px 30px rgba(0,0,0,0.8); }
  }
  .hero p {
    font-size: 1.6rem;
    font-weight: 300;
    margin-bottom: 20px;
    opacity: 0.95;
  }
  .breadcrumbs {
    display: flex;
    justify-content: center;
    gap: 8px;
    font-size: 1.1rem;
    color: #e0ecd0;
  }
  .breadcrumbs a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(255,255,255,0.15);
    padding: 6px 14px;
    border-radius: 40px;
    transition: 0.2s;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .breadcrumbs a:hover {
    background: rgba(255,255,255,0.25);
    transform: scale(1.05);
  }

  /* ----- Gallery Header ----- */
  .gallery-header {
    text-align: center;
    margin-bottom: 48px;
  }
  .gallery-header h2 {
    font-size: 2.8rem;
    font-weight: 600;
    color: #2b4b2b;
    letter-spacing: -0.02em;
    margin-bottom: 16px;
  }
  .gallery-header p {
    font-size: 1.2rem;
    color: #4a6b4a;
    max-width: 700px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }

  /* Categories */
  .categories {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
  }
  .category-btn {
    background: #f0f6f0;
    border: 2px solid #bcd0bc;
    color: #2b4b2b;
    font-size: 1rem;
    font-weight: 600;
    padding: 10px 24px;
    border-radius: 40px;
    cursor: pointer;
    transition: all 0.25s ease;
    box-shadow: 0 4px 8px rgba(30,60,30,0.05);
    text-transform: capitalize;
  }
  .category-btn:hover {
    background: #ddeade;
    border-color: #4f7a4f;
    transform: translateY(-3px);
    box-shadow: 0 12px 20px -12px #3a6b3a;
  }
  .category-btn.active {
    background: #4f7a4f;
    border-color: #2b4b2b;
    color: white;
    box-shadow: 0 8px 16px -6px #3a6b3a;
  }

  /* ----- Gallery Grid ----- */
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 28px;
    margin: 50px 0;
  }

  /* Gallery Card with unique entrance animations */
  .gallery-card {
    position: relative;
    border-radius: 24px;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 20px 30px -10px rgba(30,60,30,0.2);
    transition: all 0.4s ease;
    background: white;
    border: 2px solid transparent;
    will-change: transform;
    animation: var(--anim) 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.1) forwards;
    opacity: 0;
  }
  /* Entrance animations */
  @keyframes slideInLeft {
    0% { transform: translateX(-80px) scale(0.9); opacity: 0; }
    60% { transform: translateX(8px) scale(1.02); }
    100% { transform: translateX(0) scale(1); opacity: 1; }
  }
  @keyframes slideInRight {
    0% { transform: translateX(80px) scale(0.9); opacity: 0; }
    60% { transform: translateX(-8px) scale(1.02); }
    100% { transform: translateX(0) scale(1); opacity: 1; }
  }
  @keyframes slideInUp {
    0% { transform: translateY(80px) scale(0.9); opacity: 0; }
    60% { transform: translateY(-8px) scale(1.02); }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes slideInDown {
    0% { transform: translateY(-80px) scale(0.9); opacity: 0; }
    60% { transform: translateY(8px) scale(1.02); }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes zoomRotate {
    0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
    70% { transform: scale(1.05) rotate(2deg); }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }

  /* Hover effect: larger scale, deeper shadow, border glow */
  .gallery-card:hover {
    transform: scale(1.05);
    box-shadow: 0 40px 50px -16px #1b3b1b;
    border-color: #8fb08f;
    transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.3s ease;
    z-index: 10;
  }

  .gallery-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
  }
  .gallery-card:hover img {
    transform: scale(1.15);
  }

  /* Overlay container – hidden initially, appears on hover */
  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(30, 60, 30, 0.95));
    color: white;
    padding: 20px;
    backdrop-filter: blur(4px);
    transform: translateY(100%);
    transition: transform 0.4s ease, background 0.3s ease;
    pointer-events: none;
  }

  .gallery-card:hover .overlay {
    transform: translateY(0);
  }

  .overlay h3 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: white;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .overlay span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 1rem;
    color: #e0f0d0;
  }

  .description {
    margin-top: 10px;
    font-size: 0.95rem;
    line-height: 1.4;
    color: #f5fff0;
    font-style: italic;
    border-top: 1px solid rgba(255,255,255,0.2);
    padding-top: 8px;
  }

  /* ----- Lightbox ----- */
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(20, 35, 20, 0.95);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .lightbox-image {
    max-height: 80vh;
    max-width: 85vw;
    border-radius: 28px;
    box-shadow: 0 30px 50px rgba(20, 40, 20, 0.6);
    border: 4px solid #9fb89f;
    animation: zoomIn 0.35s ease;
  }
  @keyframes zoomIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .close-btn, .nav-btn {
    position: absolute;
    background: #f0f6f0;
    border: none;
    width: 54px;
    height: 54px;
    border-radius: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #2b4b2b;
    box-shadow: 0 8px 22px rgba(20,40,20,0.25);
    transition: all 0.2s ease;
    border: 2px solid #bcd0bc;
  }
  .close-btn:hover, .nav-btn:hover {
    background: #4f7a4f;
    color: white;
    border-color: #f0f6f0;
    transform: scale(1.08);
  }
  .close-btn {
    top: 30px;
    right: 30px;
  }
  .nav-btn.left {
    left: 30px;
  }
  .nav-btn.right {
    right: 30px;
  }
  .lightbox-info {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(245, 250, 240, 0.9);
    backdrop-filter: blur(4px);
    padding: 14px 28px;
    border-radius: 60px;
    display: flex;
    gap: 24px;
    color: #2b4b2b;
    font-weight: 500;
    border: 2px solid #9fb89f;
    box-shadow: 0 8px 20px rgba(20,40,20,0.2);
  }
  .lightbox-info h3 {
    font-size: 1.4rem;
    color: #2b4b2b;
  }
  .lightbox-info span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #4f7a4f;
  }

  /* Responsive */
  @media (max-width: 800px) {
    .hero h1 { font-size: 3rem; }
    .hero p { font-size: 1.3rem; }
    .gallery-header h2 { font-size: 2.2rem; }
    .lightbox-info { flex-direction: column; gap: 6px; text-align: center; }
  }
  @media (max-width: 500px) {
    .hero { height: 60vh; }
    .breadcrumbs { flex-wrap: wrap; }
    .nav-btn, .close-btn { width: 44px; height: 44px; }
    .gallery-grid { gap: 16px; }
  }
`;

// -------------------- Hero Slideshow Images --------------------
const heroImages = [
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920", // Serengeti
  "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1920", // Lion
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920", // Beach
  "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920", // Lalibela
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920", // Kilimanjaro
];

// -------------------- Gallery Images with Descriptions --------------------
const categories = [
  "all",
  "wildlife",
  "landscapes",
  "culture",
  "adventure",
  "beaches",
];

const images = [
  // Wildlife
  { id: 1, src: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=1200", category: "wildlife", title: "Lion at Dawn", location: "Maasai Mara, Kenya", description: "The king of the savannah wakes to the golden sunrise." },
  { id: 2, src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200", category: "wildlife", title: "Zebra Crossing", location: "Serengeti, Tanzania", description: "Stripes blur as the herd moves across the plains." },
  { id: 3, src: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=1200", category: "wildlife", title: "Mountain Gorilla", location: "Bwindi, Uganda", description: "A gentle giant in the misty rainforest." },
  { id: 4, src: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=1200", category: "wildlife", title: "Elephant Herd", location: "Amboseli, Kenya", description: "Matriarchs leading the way with Kilimanjaro watching." },
  { id: 5, src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", category: "wildlife", title: "Cheetah Speed", location: "Serengeti, Tanzania", description: "The fastest land animal on the hunt." },
  { id: 6, src: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200", category: "wildlife", title: "Giraffe Sunset", location: "Nairobi, Kenya", description: "Towering silhouettes against the African dusk." },
  // Landscapes
  { id: 7, src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200", category: "landscapes", title: "Mount Kenya", location: "Kenya", description: "Snow-capped peaks nearly on the equator." },
  { id: 8, src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200", category: "landscapes", title: "Ngorongoro Crater", location: "Tanzania", description: "A natural amphitheater teeming with wildlife." },
  { id: 9, src: "https://images.unsplash.com/photo-1564951434112-64d74cc2a2d6?w=1200", category: "landscapes", title: "Volcanoes National Park", location: "Rwanda", description: "Lush slopes where gorillas roam." },
  { id: 10, src: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200", category: "landscapes", title: "Bamboo Forest", location: "Virunga, DRC", description: "Mystical groves hidden in the clouds." },
  { id: 11, src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200", category: "landscapes", title: "Great Rift Valley", location: "Kenya", description: "Earth's ancient scar, stretching to the horizon." },
  // Culture
  { id: 12, src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200", category: "culture", title: "Lalibela Churches", location: "Ethiopia", description: "Rock-hewn wonders of faith and engineering." },
  { id: 13, src: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?w=1200", category: "culture", title: "Maasai Elders", location: "Kenya", description: "Keepers of tradition in vibrant shúkàs." },
  { id: 14, src: "https://images.unsplash.com/photo-1529078155055-5d1f45d98bc5?w=1200", category: "culture", title: "Ethiopian Coffee", location: "Addis Ababa", description: "The birthplace of coffee, brewed with ceremony." },
  { id: 15, src: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?w=1200", category: "culture", title: "Swahili Coast", location: "Lamu, Kenya", description: "Ancient dhows and coral stone alleys." },
  // Adventure
  { id: 16, src: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200", category: "adventure", title: "Kilimanjaro Summit", location: "Tanzania", description: "Standing at the roof of Africa, above the clouds." },
  { id: 17, src: "https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=1200", category: "adventure", title: "Whitewater Rafting", location: "Jinja, Uganda", description: "Conquering the Nile's wild rapids." },
  { id: 18, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200", category: "adventure", title: "Hot Air Balloon", location: "Serengeti", description: "Silent drift over the endless plains at dawn." },
  // Beaches
  { id: 19, src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200", category: "beaches", title: "Diani Beach", location: "Kenya", description: "Powder-white sand and turquoise Indian Ocean." },
  { id: 20, src: "https://images.unsplash.com/photo-1590523277543-a94c2e4ebc9b?w=1200", category: "beaches", title: "Zanzibar Sunset", location: "Tanzania", description: "Spice island skies painted in orange and purple." },
  { id: 21, src: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1200", category: "beaches", title: "Paje Beach", location: "Zanzibar", description: "Kite surfers glide over shallow turquoise lagoons." },
  { id: 22, src: "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=1200", category: "beaches", title: "Mnemba Island", location: "Tanzania", description: "An exclusive atoll surrounded by coral gardens." },
];

// Helper to assign unique entrance animation per card
const getEntranceAnimation = (index) => {
  const animations = [
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideInDown',
    'zoomRotate',
    'slideInLeft',
    'slideInRight',
    'slideInUp',
    'slideInDown',
    'zoomRotate',
  ];
  return animations[index % animations.length];
};

// -------------------- Component --------------------
const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // change every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredImages = useMemo(() => {
    return selectedCategory === "all"
      ? images
      : images.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  const openLightbox = (index) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);

  const nextImage = useCallback(() => {
    setActiveIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  }, [filteredImages.length]);

  const prevImage = useCallback(() => {
    setActiveIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  }, [filteredImages.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, nextImage, prevImage]);

  return (
    <>
      <style>{styles}</style>

      {/* Hero Slideshow */}
      <div className="hero">
        <div className="slideshow-container">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`slide ${idx === heroSlideIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="hero-content">
          <h1>Photo Gallery</h1>
          <p>A visual journey through the wonders of East Africa.</p>
          <div className="breadcrumbs">
            <a href="/"><FiHome /> Home</a>
            <span style={{ margin: '0 4px' }}>/</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '40px' }}>Gallery</span>
          </div>
        </div>
      </div>

      <section className="gallery-section">
        <div className="container">
          <div className="gallery-header">
            <h2>Captured Moments</h2>
            <p>
              Explore stunning photography from unforgettable adventures
              across East Africa.
            </p>

            <div className="categories">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-btn ${
                    selectedCategory === cat ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="gallery-grid">
            {filteredImages.map((image, index) => (
              <div
                key={image.id}
                className="gallery-card"
                onClick={() => openLightbox(index)}
                style={{
                  '--anim': `${getEntranceAnimation(index)} 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.1) forwards`,
                  animation: `var(--anim)`
                }}
              >
                <img src={image.src} alt={image.title} loading="lazy" />
                <div className="overlay">
                  <h3>{image.title}</h3>
                  <span>
                    <FiMapPin size={14} /> {image.location}
                  </span>
                  <p className="description">{image.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {activeIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="close-btn" onClick={closeLightbox}>
            <FiX size={24} />
          </button>

          <button
            className="nav-btn left"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <FiChevronLeft size={28} />
          </button>

          <img
            src={filteredImages[activeIndex].src}
            alt={filteredImages[activeIndex].title}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="nav-btn right"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <FiChevronRight size={28} />
          </button>

          <div className="lightbox-info">
            <h3>{filteredImages[activeIndex].title}</h3>
            <span>
              <FiMapPin size={16} /> {filteredImages[activeIndex].location}
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;