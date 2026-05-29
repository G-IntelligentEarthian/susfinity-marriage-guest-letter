import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number; // initial horizontal position %
  delay: number; // animation delay in seconds
  color: string;
  size: number;
  rotation: number;
  drift: number; // random horizontal drift
  duration: number; // fall duration in seconds
  shape: 'circle' | 'square' | 'triangle';
}

const PALETTE = [
  '#7b9076', // Sage Green
  '#a3b899', // Light Sage
  '#e5c583', // Antique Gold
  '#d8c7a8', // Champagne Gold
  '#f5ebe0', // Warm Offwhite
  '#e29578', // Soft Terracotta
  '#a8dadc', // Muted Teal
];

export function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const temp: Particle[] = [];
    const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
    for (let i = 0; i < 110; i++) {
      temp.push({
        id: i,
        x: Math.random() * 100, // percentage across screen width
        delay: Math.random() * 2.2, // step-delayed cascading entry
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        size: Math.random() * 10 + 6, // sizes between 6px and 16px
        rotation: (Math.random() - 0.5) * 540,
        drift: (Math.random() - 0.5) * 160, // drifting horizontally as it falls
        duration: Math.random() * 3.2 + 2.8, // elegant gentle descent
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
    setParticles(temp);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-100 overflow-hidden">
      {particles.map((p) => {
        let borderRadius = '2px';
        let clipPath = undefined;
        if (p.shape === 'circle') {
          borderRadius = '50%';
        } else if (p.shape === 'triangle') {
          clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        }

        return (
          <motion.div
            key={p.id}
            initial={{
              opacity: 0,
              y: '-10vh',
              x: `${p.x}vw`,
              rotate: 0,
              scale: 0.6,
            }}
            animate={{
              opacity: [0, 1, 1, 0.8, 0],
              y: '105vh',
              x: `calc(${p.x}vw + ${p.drift}px)`,
              rotate: p.rotation,
              scale: [0.6, 1.2, 1, 0.9, 0.4],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.25, 0.1, 0.25, 1], // customized cubic-bezier ease for drift simulation
            }}
            className="absolute shadow-xs"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius,
              clipPath,
              transformOrigin: 'center',
            }}
          />
        );
      })}
    </div>
  );
}
