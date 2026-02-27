import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiStar,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiZap,
  FiCompass,
  FiActivity,
  FiPlay,
  FiMap,
} from "react-icons/fi";
import { MdOutlineNaturePeople, MdOutlineEco } from "react-icons/md";
import Button from "./Button";
import { useApp } from "../../context/AppContext";

const DestinationCard = ({ destination, index }) => {
  const images = destination.images || [destination.heroImage];
  const safeImages = images.filter(Boolean).length
    ? images.filter(Boolean)
    : [
        "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
      ];
  const [current, setCurrent] = useState(0);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 500) + 100);
  const [isLiked, setIsLiked] = useState(false);
  const { playVideo, openMap } = useApp();

  const tourismVideos = [
    "eoTKXtrRjmY", // Wild Kenya
    "8YVlT7GFqzA", // Serengeti Safari
    "86aGcUQq_1E", // Maasai Mara Migration
    "0RZknKnFqOg", // East Africa Documentary
    "wP4AAYn5tqY", // Akagera NP
    "8YVlT7GFqzA", // Nature Spectacle
    "eoTKXtrRjmY", // Big Five
    "86aGcUQq_1E", // Wildebeest crossing
  ];

  const [imageError, setImageError] = useState(false);
  const fallbackImage =
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800";

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [safeImages.length]);

  const nextSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % safeImages.length);
  };

  const prevSlide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  const toggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handlePlayVideo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const randomIdx = Math.floor(Math.random() * tourismVideos.length);
    playVideo(tourismVideos[randomIdx], `${destination.name} Experience`);
  };

  const handleOpenMap = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openMap({
      title: `${destination.name} Map View`,
      lat: destination?.coordinates?.lat,
      lng: destination?.coordinates?.lng,
      query: destination?.location || destination?.countryId || destination?.name,
      zoom: 9,
    });
  };

  return (
    <>
      <motion.div
        className="destination-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        style={{
          width: "100%",
          backgroundColor: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
          border: "1px solid #f0fdf4",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
          transition: "transform 0.28s ease, box-shadow 0.28s ease",
        }}
      >
        {/* Slideshow Image Area */}
        <div
          className="destination-card-media"
          style={{
            position: "relative",
            height: "clamp(220px, 30vw, 280px)",
            width: "100%",
            overflow: "hidden",
            contain: "layout paint",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={imageError ? fallbackImage : safeImages[current]}
              alt={destination.name}
              onError={() => setImageError(true)}
              initial={{
                opacity: 0,
                scale: 1.06,
                x: current % 2 === 0 ? -10 : 10,
              }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98, x: current % 2 === 0 ? 10 : -10 }}
              transition={{
                duration: 0.75,
                ease: [0.22, 1, 0.36, 1],
              }}
              loading="lazy"
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "translateZ(0)",
                willChange: "transform, opacity",
              }}
            />
          </AnimatePresence>

          {/* Gradient Overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(2, 44, 34, 0.8) 0%, rgba(5, 150, 105, 0.2) 50%, transparent 100%)",
            }}
          />

          {/* Nav Buttons */}
          {safeImages.length > 1 && (
            <>
              <button
                className="destination-card-nav-button"
                onClick={prevSlide}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                  padding: "8px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(-50%) scale(1)")
                }
              >
                <FiChevronLeft size={20} color="#065f46" />
              </button>
              <button
                className="destination-card-nav-button"
                onClick={nextSlide}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(4px)",
                  padding: "8px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "translateY(-50%) scale(1.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "translateY(-50%) scale(1)")
                }
              >
                <FiChevronRight size={20} color="#065f46" />
              </button>
            </>
          )}

          {/* Play Button Overlay */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 15,
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={handlePlayVideo}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#059669";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FiPlay size={20} />
            </button>
            <button
              onClick={handleOpenMap}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              title="Open mini map"
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#0EA5E9";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <FiMap size={18} />
            </button>
          </div>

          {/* Floating Text on Image */}
          <div
            className="destination-card-overlay-content"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "24px",
              right: "20px",
              color: "white",
              zIndex: 5,
              minWidth: 0,
            }}
          >
            <h3
              style={{
                fontSize: "clamp(20px, 2.4vw, 24px)",
                fontWeight: "700",
                marginBottom: "4px",
                fontFamily: "'Playfair Display', serif",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                overflowWrap: "anywhere",
              }}
            >
              {destination.name}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "14px",
                opacity: 0.9,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              <FiMapPin style={{ marginRight: "6px" }} />
              {destination.location ||
                (destination.countryId
                  ? destination.countryId.charAt(0).toUpperCase() +
                    destination.countryId.slice(1)
                  : "East Africa")}
            </div>
          </div>

          {safeImages.length > 1 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "12px",
                transform: "translateX(-50%)",
                zIndex: 16,
                display: "flex",
                gap: "6px",
              }}
            >
              {safeImages.map((_, idx) => (
                <span
                  key={`${destination.id}-dot-${idx}`}
                  style={{
                    width: idx === current ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "999px",
                    background:
                      idx === current ? "rgba(16,185,129,0.95)" : "rgba(255,255,255,0.62)",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div
          className="destination-card-body"
          style={{
            padding: "clamp(18px, 2.4vw, 28px)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <p
            style={{
              color: "#4b5563",
              fontSize: "15px",
              lineHeight: "1.6",
              marginBottom: "20px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {destination.description}
          </p>

          {/* Rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "24px",
              color: "#059669",
              flexWrap: "wrap",
              rowGap: "8px",
            }}
          >
            <div style={{ display: "flex" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  size={18}
                  style={{
                    fill:
                      star <= Math.floor(destination.rating || 5)
                        ? "#10b981"
                        : "none",
                    marginRight: "2px",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                marginLeft: "12px",
                fontWeight: "600",
                fontSize: "15px",
                overflowWrap: "anywhere",
              }}
            >
              {destination.rating || "5.0"} Nature Experience
            </span>
          </div>

          {/* Features Grid */}
          <div
            className="destination-card-features"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <MdOutlineEco size={20} color="#059669" />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                Eco-Conservation
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiZap size={20} color="#059669" />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                {destination.type || "Adventure"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiCompass size={20} color="#059669" />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                Expert Guides
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FiClock size={20} color="#059669" />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                {destination.duration || "Flexible"}
              </span>
            </div>
          </div>

          {/* Interaction Footer */}
          <div
            className="destination-card-footer"
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f0fdf4",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #dcfce7",
              }}
            >
              <div
                onClick={toggleLike}
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#065f46",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                <FiHeart
                  style={{
                    marginRight: "8px",
                    fill: isLiked ? "#ef4444" : "none",
                    color: isLiked ? "#ef4444" : "inherit",
                  }}
                />
                Visitor Likes
              </div>
              <div
                style={{
                  color: "#065f46",
                  fontWeight: "800",
                  fontSize: "18px",
                }}
              >
                {likes}
              </div>
            </div>

            <Button
              to={`/destination/${destination.id}`}
              variant="primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "center",
                overflowWrap: "anywhere",
              }}
            >
              Discover {destination.name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </motion.div>
      <style>{`
      .destination-card {
        min-width: 0;
        overflow: hidden;
        contain: content;
      }
      .destination-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 24px 45px rgba(0,0,0,0.16);
      }

      .destination-card-overlay-content {
        right: 20px;
      }

      @media (max-width: 1024px) {
        .destination-card-media {
          height: 240px !important;
        }
      }

      @media (max-width: 768px) {
        .destination-card-media {
          height: 220px !important;
        }

        .destination-card-overlay-content {
          left: 16px !important;
          right: 16px !important;
          bottom: 14px !important;
        }

        .destination-card-features {
          grid-template-columns: 1fr !important;
          gap: 12px !important;
          margin-bottom: 22px !important;
        }

        .destination-card-nav-button {
          width: 34px !important;
          height: 34px !important;
          padding: 0 !important;
        }

        .destination-card-footer {
          gap: 14px !important;
        }

        .destination-card-body {
          padding: 18px !important;
        }
      }
    `}</style>
    </>
  );
};

export default DestinationCard;
