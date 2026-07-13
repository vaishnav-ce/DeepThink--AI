import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BinaryPupil({ status = 'idle', className = "w-32 h-32 mb-6" }) {
  // status: 'idle' | 'scanning' | 'human' | 'ai'

  const getColor = () => {
    switch (status) {
      case 'human': return '#00ff88'; // neon green
      case 'ai': return '#ff0055'; // neon red
      default: return '#00e5ff'; // neon cyan
    }
  };

  const color = getColor();
  const isGlitching = status === 'ai';
  const isScanning = status === 'scanning';

  return (
    <div className={`relative mx-auto flex items-center justify-center ${className}`}>
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={isGlitching ? {
          x: [0, -2, 2, -1, 1, 0],
          opacity: [1, 0.8, 1, 0.9, 1],
          filter: [
            "drop-shadow(0 0 10px rgba(255,0,85,0.8)) hue-rotate(0deg)",
            "drop-shadow(0 0 20px rgba(255,0,85,1)) hue-rotate(15deg)",
            "drop-shadow(0 0 5px rgba(255,0,85,0.6)) hue-rotate(-15deg)",
            "drop-shadow(0 0 10px rgba(255,0,85,0.8)) hue-rotate(0deg)"
          ]
        } : {}}
        transition={isGlitching ? { repeat: Infinity, duration: 0.15, repeatType: 'mirror' } : {}}
      >
        {/* Outer Eye Outline */}
        <path
          d="M 2 50 Q 50 15 98 50 Q 50 85 2 50 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Left Iris Arc */}
        <path
          d="M 37 21 A 30 30 0 0 0 37 79"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Right Iris Arc */}
        <path
          d="M 43 21 A 30 30 0 0 1 43 79"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Glowing Hexagon Pupil */}
        <motion.polygon
          points="22,35 42,35 52,50 42,65 22,65 12,50"
          fill={color}
          style={{ transition: 'fill 0.5s ease-in-out', filter: `drop-shadow(0 0 10px ${color})` }}
          animate={{ scale: isScanning ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />

        {/* Tech 'D' Shape Container */}
        <g stroke="white" strokeWidth="1.5" fill="none">
          {/* Outer track */}
          <path d="M 54 36 L 68 36 Q 82 36 82 50 Q 82 64 68 64 L 54 64 Z" />
          {/* Inner track */}
          <path d="M 57 40 L 65 40 Q 76 40 76 50 Q 76 60 65 60 L 57 60 Z" />
        </g>

        {/* Circuit Data Lines extending left into pupil body */}
        <g stroke="white" strokeWidth="1.5" fill="none">
          {/* Top Line */}
          <line x1="48" y1="44" x2="65" y2="44" />
          <circle cx="46" cy="44" r="1.8" />
          
          {/* Bottom Line */}
          <line x1="48" y1="56" x2="65" y2="56" />
          <circle cx="46" cy="56" r="1.8" />
        </g>

        {/* Small solid trace nodes inside 'D' */}
        <g fill="white">
          <circle cx="65" cy="44" r="1.5" />
          <circle cx="65" cy="56" r="1.5" />
        </g>

        {/* Horizontal Laser Line when Scanning */}
        <AnimatePresence>
            {isScanning && (
              <motion.line
                x1="0"
                y1="20"
                x2="100"
                y2="20"
                stroke="#00e5ff"
                strokeWidth="2"
                initial={{ translateY: 0, opacity: 0 }}
                animate={{ translateY: [0, 60, 0], opacity: [0, 1, 1, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                style={{
                  filter: 'drop-shadow(0 0 8px #00e5ff)'
                }}
                exit={{ opacity: 0 }}
              />
            )}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
}
