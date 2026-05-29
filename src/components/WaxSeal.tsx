import React from 'react';
import { motion } from 'motion/react';
import { SusfinityLogo } from './SusfinityLogo';

interface WaxSealProps {
  onClick?: () => void;
  isOpen?: boolean;
}

export const WaxSeal: React.FC<WaxSealProps> = ({ onClick, isOpen = false }) => {
  return (
    <motion.div
      id="wax-seal"
      className="absolute left-1/2 top-1/2 z-50 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      animate={{
        scale: isOpen ? 0.4 : 1,
        y: isOpen ? -45 : 0,
        opacity: isOpen ? 0 : 1,
        pointerEvents: isOpen ? 'none' : 'auto',
      }}
      transition={{
        type: 'spring',
        stiffness: isOpen ? 250 : 120, // gentler spring bounce when stamping down
        damping: isOpen ? 22 : 15,
        delay: isOpen ? 0 : 1.35, // wait for letter slide (0.85s) + flap fold down (0.5s)
      }}
    >
      {/* Organic wax seal background (melted irregular shape) */}
      <div 
        className="absolute inset-0 rounded-full bg-radial from-[#9c4c2a] via-[#85341c] to-[#601a09] shadow-[0_6px_16px_rgba(0,0,0,0.35),_inset_0_-4px_8px_rgba(0,0,0,0.3),_inset_0_2px_4px_rgba(255,255,255,0.25)]"
        style={{
          borderRadius: '52% 48% 54% 46% / 49% 51% 47% 53%', // Irregular molten outline
          border: '1px solid #731e0b',
        }}
      />

      {/* Recessed debossed inner circle */}
      <div 
        className="absolute h-[80%] w-[80%] rounded-full bg-radial from-[#722411] via-[#82321a] to-[#4e1004] border border-[#a14b30]/30 shadow-[inset_0_3px_5px_rgba(0,0,0,0.6),_0_2px_2px_rgba(255,255,255,0.15)] flex items-center justify-center"
      >
        {/* Debossed gold-whitened Susfinity Logo */}
        <SusfinityLogo 
          variant="monochrome" 
          size="78%" 
          className="opacity-90 filter drop-shadow-[0_-1px_1px_rgba(0,0,0,0.7)] hover:opacity-100 transition-opacity"
        />
      </div>

      {/* Gloss reflection highlight across the seal */}
      <div 
        className="absolute inset-[10%] rounded-full bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none rotate-45"
        style={{
          borderRadius: '52% 48% 54% 46% / 49% 51% 47% 53%',
        }}
      />
    </motion.div>
  );
};
