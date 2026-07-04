import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * FeaturedCountryCard - A beautifully designed card for featured countries
 * with image slideshow, featured badge, and essential information.
 * Matches the user's requested design specification.
 */
export default function FeaturedCountryCard({ destination }) {
  // Extract images array with fallback
  const images = destination.images?.filter(Boolean)?.length > 0
    ? destination.images.filter(Boolean)
    : (destination.heroImage ? [destination.heroImage] : [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800",
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
        "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      ]);

  const [currentImage, setCurrentImage] = useState(0);

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images]);

  // Data extraction with sensible fallbacks
  const name = destination.name || 'Country Name';
  const location = destination.capital || destination.name || 'East Africa';
  const description = destination.shortDescription ||
    destination.description?.slice(0, 120) +
    (destination.description?.length > 120 ? '...' : '') ||
    'Discover breathtaking landscapes, rich cultural heritage, and unforgettable adventures in this stunning destination.';
  const slug = destination.slug || destination.id || destination.name?.toLowerCase().replace(/\s+/g, '-');
  const countrySlug = destination.countrySlug || destination.slug || destination.id || slug;

  return (
    <div className="featured-country-card-wrapper" style={{ height: '100%' }}>
      <style>{`
        .fcc-card {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, box-shadow;
        }
        .fcc-card:hover {
          transform: scale(1.02);
          box-shadow: 0 32px 64px -16px rgba(5, 150, 105, 0.2),
                      0 0 0 1px rgba(5, 150, 105, 0.1);
        }
        .fcc-indicator {
          transition: width 0.3s ease, background-color 0.3s ease;
          will-change: width, background-color;
        }
        .fcc-indicator.active {
          width: 1.5rem;
          background-color: #ffffff;
        }
        .fcc-indicator:not(.active) {
          width: 0.5rem;
          background-color: rgba(255, 255, 255, 0.6);
        }
        .fcc-cta {
          transition: all 0.3s ease;
        }
        .fcc-cta:hover {
          background: linear-gradient(135deg, #047857, #059669) !important;
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -6px rgba(5, 150, 105, 0.5),
                      0 0 0 1px rgba(5, 150, 105, 0.15) !important;
        }
        @keyframes fcc-pulse-ring {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }
        .fcc-pulse {
          animation: fcc-pulse-ring 2s infinite;
        }
      `}</style>

      <div className="fcc-card" style={{
        position: 'relative',
        borderRadius: '32px',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.08)',
        border: '1px solid rgba(5, 150, 105, 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
      }}>
        {/* Slideshow Image Section */}
        <div style={{ position: 'relative', height: 280, overflow: 'hidden' }}>
          {images.map((img, i) => (
            <img
              key={`${img}-${i}`}
              src={img}
              alt={name}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: i === currentImage ? 1 : 0,
                transition: 'opacity 0.7s ease-in-out',
              }}
            />
          ))}

          {/* Gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Featured Badge */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: '1.25rem',
            zIndex: 10,
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            color: '#fff',
            padding: '0.375rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
            Featured Place
          </div>

          {/* Pulse ring animation behind badge */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: '5rem',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: '2px solid rgba(245, 158, 11, 0.4)',
            zIndex: 9,
            pointerEvents: 'none',
          }} className="fcc-pulse" />

          {/* Slide Indicators */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 10,
            }}>
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`fcc-indicator ${i === currentImage ? 'active' : ''}`}
                  style={{ height: '0.5rem', borderRadius: '9999px' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          flex: 1,
        }}>
          {/* Title + Subtitle */}
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.3,
              margin: 0,
            }}>
              {name}
            </h2>
            <p style={{
              fontSize: '0.875rem',
              color: '#6B7280',
              marginTop: '0.25rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}>
              {location}
            </p>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '0.875rem',
            color: '#4B5563',
            lineHeight: 1.7,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {description}
          </p>

          {/* Info Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              borderRadius: '1rem',
              padding: '1rem',
              border: '1px solid #a7f3d0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}>
                Location
              </p>
              <p style={{
                fontWeight: 600,
                color: '#1F2937',
                fontSize: '0.875rem',
              }}>
                {location}
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
              borderRadius: '1rem',
              padding: '1rem',
              border: '1px solid #a7f3d0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.25rem',
              }}>
                Rating
              </p>
              <p style={{
                fontWeight: 600,
                color: '#1F2937',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ color: '#F59E0B' }}>★</span> 5.0
              </p>
            </div>
          </div>

          {/* Button */}
          <Link
            to={`/country/${countrySlug}`}
            className="fcc-cta"
            style={{
              display: 'block',
              width: '100%',
              background: 'linear-gradient(135deg, #059669, #10B981)',
              color: '#fff',
              padding: '0.875rem 1.5rem',
              borderRadius: '1rem',
              fontWeight: 600,
              textAlign: 'center',
              textDecoration: 'none',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4), 0 0 0 1px rgba(5, 150, 105, 0.1)',
              marginTop: 'auto',
            }}
          >
            Explore Destination
          </Link>
        </div>
      </div>
    </div>
  );
}
