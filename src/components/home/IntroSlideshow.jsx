import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const slideshowImages = [
  {
    url: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1200',
    title: 'Serengeti Safari',
    category: 'Wildlife'
  },
  {
    url: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1200',
    title: 'Gorilla Encounter',
    category: 'Adventure'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200',
    title: 'Zanzibar Shores',
    category: 'Relaxation'
  },
  {
    url: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200',
    title: 'Ancient Wonders',
    category: 'Culture'
  }
];

const IntroSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  return (
    <div 
      style={{
        position: 'relative',
        width: '100%',
        height: 'clamp(400px, 50vw, 600px)',
        borderRadius: '30px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)',
        background: '#f3f4f6',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        >
          <motion.img
            src={slideshowImages[currentIndex].url}
            alt={slideshowImages[currentIndex].title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            animate={{ scale: [1, 1.05] }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          />
          
          {/* Content Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '40px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            color: 'white'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: '#10B981',
                marginBottom: '8px',
                display: 'block'
              }}>
                {slideshowImages[currentIndex].category}
              </span>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '28px',
                fontWeight: '700',
              }}>
                {slideshowImages[currentIndex].title}
              </h3>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        right: '20px',
        transform: 'translateY(-50%)',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.9)', color: '#059669' }}
          whileTap={{ scale: 0.9 }}
          onClick={prevSlide}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            transition: 'all 0.3s ease'
          }}
        >
          <FiChevronLeft size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.9)', color: '#059669' }}
          whileTap={{ scale: 0.9 }}
          onClick={nextSlide}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
            transition: 'all 0.3s ease'
          }}
        >
          <FiChevronRight size={24} />
        </motion.button>
      </div>

      {/* Progress Indicators */}
      <div style={{
        position: 'absolute',
        top: '30px',
        right: '30px',
        display: 'flex',
        gap: '8px',
        zIndex: 10
      }}>
        {slideshowImages.map((_, index) => (
          <div
            key={index}
            style={{
              width: currentIndex === index ? '30px' : '8px',
              height: '8px',
              borderRadius: '10px',
              backgroundColor: currentIndex === index ? '#10B981' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Floating Badge (Integrated) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          padding: '12px 20px',
          backgroundColor: 'rgba(5, 150, 105, 0.9)',
          borderRadius: '16px',
          color: 'white',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(5, 150, 105, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '20px', fontWeight: '800', lineHeight: 1 }}>10+</span>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Countries</span>
      </motion.div>
    </div>
  );
};

export default IntroSlideshow;
