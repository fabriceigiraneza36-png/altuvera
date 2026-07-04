import React, { useMemo } from "react";

const shimmerStyle = {
  background:
    "linear-gradient(90deg, rgba(2,44,34,0.06) 0%, rgba(16,185,129,0.14) 45%, rgba(2,44,34,0.06) 100%)",
  backgroundSize: "200% 100%",
  animation: "altu-skeleton-shimmer 1.15s ease-in-out infinite",
};

// Bubble animation data generator
const useBubbleAnimation = (count = 8) => {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        size: 14 + Math.random() * 18,
        opacity: 0.12 + Math.random() * 0.08,
        duration: `${10 + Math.random() * 8}s`,
        delay: `${Math.random() * 6}s`,
      })),
    [count],
  );
};

// Particle animation data generator
const useParticleAnimation = (count = 6) => {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        size: 2 + Math.random() * 2.5,
        delay: `${Math.random() * 5}s`,
        duration: `${7 + Math.random() * 5}s`,
        opacity: 0.12 + Math.random() * 0.08,
      })),
    [count],
  );
};

// Bubble styles
const bubbleBaseStyle = {
  position: "absolute",
  borderRadius: "50%",
  pointerEvents: "none",
  border: "1px solid rgba(16, 185, 129, 0.08)",
  background:
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.58) 18%, rgba(16,185,129,0.1) 55%, rgba(16,185,129,0.04) 76%, transparent 100%)",
  boxShadow:
    "inset 0 0 8px rgba(255,255,255,0.6), 0 0 8px rgba(16,185,129,0.04)",
  willChange: "transform, opacity",
};

const particleBaseStyle = {
  position: "absolute",
  borderRadius: "50%",
  pointerEvents: "none",
};

// Keyframe animations CSS
const bubbleAnimations = `
  @keyframes bubbleFloatDown1 {
    0% {
      transform: translate3d(0px, -12vh, 0) scale(0.95);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    35% {
      transform: translate3d(8px, 10vh, 0) scale(1);
    }
    62% {
      transform: translate3d(-5px, 34vh, 0) scale(1.01);
    }
    82% {
      transform: translate3d(4px, 56vh, 0) scale(0.995);
      opacity: 0.9;
    }
    100% {
      transform: translate3d(0px, 72vh, 0) scale(0.99);
      opacity: 0;
    }
  }

  @keyframes bubbleFloatDown2 {
    0% {
      transform: translate3d(0px, -14vh, 0) scale(0.95);
      opacity: 0;
    }
    12% {
      opacity: 1;
    }
    30% {
      transform: translate3d(-8px, 12vh, 0) scale(1.01);
    }
    58% {
      transform: translate3d(-14px, 36vh, 0) scale(1.02);
    }
    84% {
      transform: translate3d(-7px, 60vh, 0) scale(1);
      opacity: 0.88;
    }
    100% {
      transform: translate3d(0px, 74vh, 0) scale(0.99);
      opacity: 0;
    }
  }

  @keyframes bubbleFloatDown3 {
    0% {
      transform: translate3d(0px, -11vh, 0) scale(0.95);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    36% {
      transform: translate3d(7px, 14vh, 0) scale(1);
    }
    66% {
      transform: translate3d(12px, 40vh, 0) scale(1.015);
    }
    86% {
      transform: translate3d(5px, 61vh, 0) scale(1);
      opacity: 0.9;
    }
    100% {
      transform: translate3d(0px, 76vh, 0) scale(0.99);
      opacity: 0;
    }
  }

  @keyframes bubbleFloatDown4 {
    0% {
      transform: translate3d(0px, -13vh, 0) scale(0.94);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    34% {
      transform: translate3d(-5px, 11vh, 0) scale(1);
    }
    60% {
      transform: translate3d(9px, 35vh, 0) scale(1.02);
    }
    84% {
      transform: translate3d(3px, 59vh, 0) scale(1);
      opacity: 0.88;
    }
    100% {
      transform: translate3d(0px, 75vh, 0) scale(0.99);
      opacity: 0;
    }
  }

  @keyframes particleDrift {
    0% {
      transform: translateY(-16px);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateY(calc(100vh + 18px));
      opacity: 0;
    }
  }
`;

// Main keyframes
const mainKeyframes = `
  @keyframes altu-skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

export function SkeletonKeyframes() {
  return (
    <style>
      {`
        ${mainKeyframes}
        ${bubbleAnimations}
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}
    </style>
  );
}

// Skeleton with Bubbles wrapper component
export function SkeletonWithBubbles({ 
  children, 
  showBubbles = true, 
  bubbleCount = 8, 
  particleCount = 6,
  style = {},
  containerStyle = {},
  ...props 
}) {
  const bubbles = useBubbleAnimation(bubbleCount);
  const particles = useParticleAnimation(particleCount);

  return (
    <div 
      style={{ 
        position: "relative", 
        overflow: "hidden",
        ...containerStyle 
      }} 
      {...props}
    >
      {showBubbles && (
        <>
          {/* Ambient glow */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 30%, rgba(16,185,129,0.03) 0%, rgba(16,185,129,0.01) 40%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 1,
          }} />
          
          {/* Bubbles */}
          {bubbles.map((bubble, index) => (
            <div
              key={`bubble-${bubble.id}`}
              style={{
                ...bubbleBaseStyle,
                left: bubble.left,
                top: "-10vh",
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                opacity: bubble.opacity,
                animation: `bubbleFloatDown${(index % 4) + 1} ${bubble.duration} cubic-bezier(0.22, 1, 0.36, 1) infinite`,
                animationDelay: bubble.delay,
                zIndex: 0,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              style={{
                ...particleBaseStyle,
                left: particle.left,
                top: "-20px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(16, 185, 129, ${particle.opacity})`,
                boxShadow: "0 0 5px rgba(16,185,129,0.12)",
                animation: `particleDrift ${particle.duration} linear infinite`,
                animationDelay: particle.delay,
                zIndex: 0,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
      
      {/* Content layer */}
      <div style={{ position: "relative", zIndex: 2, ...style }}>
        {children}
      </div>
    </div>
  );
}

export function Skeleton({
  height = 14,
  width = "100%",
  radius = 10,
  style,
  className,
}) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        ...shimmerStyle,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

export function SkeletonText({ lines = 3, lineHeight = 14, gap = 10 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{ marginTop: i === 0 ? 0 : gap }}>
          <Skeleton
            height={lineHeight}
            width={i === lines - 1 ? "82%" : "100%"}
            radius={8}
          />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ style, showBubbles = false }) {
  const bubbles = useBubbleAnimation(6);
  const particles = useParticleAnimation(4);

  return (
    <div
      style={{
        borderRadius: 24,
        border: "1px solid rgba(5,150,105,0.14)",
        background: "rgba(255,255,255,0.7)",
        boxShadow: "0 18px 50px rgba(2,44,34,.06)",
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
      aria-hidden="true"
    >
      {showBubbles && (
        <>
          {/* Bubbles */}
          {bubbles.map((bubble, index) => (
            <div
              key={`bubble-${bubble.id}`}
              style={{
                ...bubbleBaseStyle,
                left: bubble.left,
                top: "-5vh",
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                opacity: bubble.opacity,
                animation: `bubbleFloatDown${(index % 4) + 1} ${bubble.duration} cubic-bezier(0.22, 1, 0.36, 1) infinite`,
                animationDelay: bubble.delay,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              style={{
                ...particleBaseStyle,
                left: particle.left,
                top: "-10px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(16, 185, 129, ${particle.opacity})`,
                boxShadow: "0 0 5px rgba(16,185,129,0.12)",
                animation: `particleDrift ${particle.duration} linear infinite`,
                animationDelay: particle.delay,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
      
      <div style={{ position: "relative", zIndex: 1 }}>
        <Skeleton height={210} radius={0} />
        <div style={{ padding: 18 }}>
          <Skeleton height={12} width={120} radius={999} />
          <div style={{ height: 12 }} />
          <Skeleton height={20} width={"88%"} radius={12} />
          <div style={{ height: 10 }} />
          <SkeletonText lines={3} lineHeight={14} gap={10} />
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <Skeleton height={34} width={110} radius={999} />
            <Skeleton height={34} width={90} radius={999} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid skeleton with bubbles
export function SkeletonGrid({ count = 6, showBubbles = false, style = {} }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 24,
        ...style,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showBubbles={showBubbles} />
      ))}
    </div>
  );
}

// Full page skeleton with bubbles
export function SkeletonPage({ showBubbles = true }) {
  const bubbles = useBubbleAnimation(12);
  const particles = useParticleAnimation(8);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "100vh",
        background: "#ffffff",
      }}
      aria-hidden="true"
    >
      {showBubbles && (
        <>
          {/* Ambient glow */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 30%, rgba(16,185,129,0.035) 0%, rgba(16,185,129,0.01) 35%, transparent 65%)",
            pointerEvents: "none",
            zIndex: 1,
          }} />
          
          {/* Bubbles */}
          {bubbles.map((bubble, index) => (
            <div
              key={`bubble-${bubble.id}`}
              style={{
                ...bubbleBaseStyle,
                left: bubble.left,
                top: "-10vh",
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                opacity: bubble.opacity,
                animation: `bubbleFloatDown${(index % 4) + 1} ${bubble.duration} cubic-bezier(0.22, 1, 0.36, 1) infinite`,
                animationDelay: bubble.delay,
                zIndex: 0,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              style={{
                ...particleBaseStyle,
                left: particle.left,
                top: "-20px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(16, 185, 129, ${particle.opacity})`,
                boxShadow: "0 0 5px rgba(16,185,129,0.12)",
                animation: `particleDrift ${particle.duration} linear infinite`,
                animationDelay: particle.delay,
                zIndex: 0,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
      
      <div style={{ position: "relative", zIndex: 2, padding: "20px" }}>
        {/* Header skeleton */}
        <div style={{ height: 60, marginBottom: 24 }}>
          <Skeleton height={60} width="100%" radius={16} />
        </div>
        
        {/* Content skeleton */}
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}

// Section skeleton for inline loading
export function SkeletonSection({ 
  height = 200, 
  showBubbles = true,
  style = {} 
}) {
  const bubbles = useBubbleAnimation(4);
  const particles = useParticleAnimation(3);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        height,
        borderRadius: 20,
        background: "rgba(255,255,255,0.5)",
        border: "1px solid rgba(5,150,105,0.1)",
        ...style,
      }}
      aria-hidden="true"
    >
      {showBubbles && (
        <>
          {/* Bubbles */}
          {bubbles.map((bubble, index) => (
            <div
              key={`bubble-${bubble.id}`}
              style={{
                ...bubbleBaseStyle,
                left: bubble.left,
                top: "-5vh",
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                opacity: bubble.opacity,
                animation: `bubbleFloatDown${(index % 4) + 1} ${bubble.duration} cubic-bezier(0.22, 1, 0.36, 1) infinite`,
                animationDelay: bubble.delay,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Particles */}
          {particles.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              style={{
                ...particleBaseStyle,
                left: particle.left,
                top: "-8px",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `rgba(16, 185, 129, ${particle.opacity})`,
                boxShadow: "0 0 5px rgba(16,185,129,0.12)",
                animation: `particleDrift ${particle.duration} linear infinite`,
                animationDelay: particle.delay,
              }}
              aria-hidden="true"
            />
          ))}
        </>
      )}
      
      {/* Center shimmer */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
      }}>
        <div style={{
          ...shimmerStyle,
          width: "60%",
          height: 8,
          borderRadius: 999,
        }} />
      </div>
    </div>
  );
}
